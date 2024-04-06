#include <node_api.h>
#include <napi.h>
#include <comdef.h>
#include <Thumbcache.h>
#include <gdiplus.h>
#include <variant>
#include <span>
#include <iostream>
#include <optional>
#include <commoncontrols.h>
#include <memory>

std::optional<std::span<Gdiplus::ImageCodecInfo>> codecsInfo{};

std::variant<std::unique_ptr<Gdiplus::Bitmap>, HRESULT> GetThumbnail(const std::u16string& path) {
    using namespace Gdiplus;
    IShellItem* item = nullptr;

    auto pathWstr = std::wstring(path.begin(), path.end());
    if (HRESULT result = SHCreateItemFromParsingName(pathWstr.c_str(), nullptr, IID_PPV_ARGS(&item)); result != S_OK) {
        return result;
    }

    IThumbnailCache* thumbnailCache = nullptr;
    if (HRESULT result = CoCreateInstance(
                CLSID_LocalThumbnailCache,
                nullptr,
                CLSCTX_INPROC,
                IID_PPV_ARGS(&thumbnailCache)); result != S_OK) {
        item->Release();
        return result;
    }

    ISharedBitmap* sharedBitmap;
    if (HRESULT result = thumbnailCache->GetThumbnail(
                item,
                256 * 256,
                WTS_EXTRACT,
                &sharedBitmap,
                nullptr,
                nullptr); result != S_OK) {
        thumbnailCache->Release();
        item->Release();
        return result;
    }

    HBITMAP bitmap = nullptr;
    if (HRESULT result = sharedBitmap->GetSharedBitmap(&bitmap); result != S_OK) {
        thumbnailCache->Release();
        item->Release();
        sharedBitmap->Release();
        return result;
    }

    return std::make_unique<Bitmap>(bitmap, nullptr);
}

std::variant<std::unique_ptr<Gdiplus::Bitmap>, HRESULT> GetIcon(const std::u16string& path) {
    using namespace Gdiplus;

    std::wstring pathWstr{path.begin(), path.end()};
    SHFILEINFOW info;

    SHGetFileInfoW(pathWstr.c_str(), FILE_ATTRIBUTE_NORMAL, &info, sizeof(info), SHGFI_SYSICONINDEX);

    IImageList* imageList;
    if (HRESULT result = SHGetImageList(SHIL_JUMBO, IID_PPV_ARGS(&imageList)); result != S_OK) {
        return result;
    }

    HICON icon;
    imageList->GetIcon(info.iIcon, ILD_TRANSPARENT, &icon);
    imageList->Release();

    ICONINFO iconInfo;
    GetIconInfo(icon, &iconInfo);
    DestroyIcon(icon);

    // get bitmap with alpha
    LOGPALETTE logPalette = {0, 1, {255, 255, 255, 0}};
    HPALETTE palette = CreatePalette(&logPalette);

    auto iconBitmap = Bitmap(iconInfo.hbmColor, palette);

    Rect rect(0, 0, static_cast<INT>(iconBitmap.GetWidth()), static_cast<INT>(iconBitmap.GetHeight()));
    BitmapData bitmapData{};
    iconBitmap.LockBits(&rect, ImageLockModeRead, iconBitmap.GetPixelFormat(), &bitmapData);
    auto iconBitmapWithAlpha = std::make_unique<Bitmap>(bitmapData.Width, bitmapData.Height, bitmapData.Stride,
                                                        PixelFormat32bppARGB, (BYTE*) bitmapData.Scan0);
    iconBitmap.UnlockBits(&bitmapData);

    return iconBitmapWithAlpha;
}

Napi::Value GetIconBuffer(const Napi::CallbackInfo& info) {
    auto env = info.Env();

    auto& pathArg = info[0];
    auto& mimeArg = info[1];

    if (!pathArg.IsString()) {
        Napi::Error::New(env, "File path is required").ThrowAsJavaScriptException();
        return env.Null();
    }

    if (!mimeArg.IsString()) {
        Napi::Error::New(env, "Mime is required").ThrowAsJavaScriptException();
        return env.Null();
    }

    auto path = pathArg.ToString().Utf16Value();
    auto mime = mimeArg.ToString().Utf16Value();

    // get bitmap
    auto rawBitmap = GetThumbnail(path);

    if (HRESULT* errorPtr = std::get_if<HRESULT>(&rawBitmap); errorPtr) {
        rawBitmap = GetIcon(path);
    }

    if (HRESULT* errorPtr = std::get_if<HRESULT>(&rawBitmap); errorPtr) {
        rawBitmap = GetIcon(path);
        Napi::Error::New(env,
                         "Failed to get bitmap").ThrowAsJavaScriptException();
        return env.Null();
    }

    // find encoder
    auto mimeWstr = std::wstring(mime.begin(), mime.end());
    auto codecResult = std::find_if(codecsInfo->begin(), codecsInfo->end(),
                                    [&](const Gdiplus::ImageCodecInfo& codecInfo) {
                                        return mimeWstr == codecInfo.MimeType;
                                    });

    if (codecResult == codecsInfo->end()) {
        Napi::Error::New(env,
                         "Failed to find encoder").ThrowAsJavaScriptException();
        return env.Null();
    }

    // save image
    IStream* istream = nullptr;
    if (CreateStreamOnHGlobal(nullptr, TRUE, &istream) != 0) {
        Napi::Error::New(env,
                         "Failed to create stream").ThrowAsJavaScriptException();
        return env.Null();
    }

    auto& bitmap = std::get<std::unique_ptr<Gdiplus::Bitmap>>(rawBitmap);
    bitmap->Save(istream, &codecResult->Clsid);

    HGLOBAL hglobal = nullptr;
    if (GetHGlobalFromStream(istream, &hglobal) != S_OK) {
        istream->Release();
        Napi::Error::New(env,
                         "Failed to get stream hglobal").ThrowAsJavaScriptException();
        return env.Null();
    }

    auto bufSize = GlobalSize(hglobal);
    auto buffer = Napi::ArrayBuffer::New(env, bufSize);
    auto data = GlobalLock(hglobal);
    memcpy(buffer.Data(), data, bufSize);
    GlobalUnlock(hglobal);
    istream->Release();

    return buffer;
}

Napi::Value InitLibrary(const Napi::CallbackInfo& info) {
    using namespace Gdiplus;

    auto env = info.Env();

    auto skipInitComArgument = info[0];
    if (!skipInitComArgument.ToBoolean()) {
        CoInitialize(nullptr);
    }

    // init gdiplus
    Gdiplus::GdiplusStartupInput gdiplusStartupInput;
    ULONG_PTR gdiplusToken;
    GdiplusStartup(&gdiplusToken, &gdiplusStartupInput, nullptr);

    // get codecs
    UINT size, count;
    if (Gdiplus::GetImageEncodersSize(&count, &size) != Status::Ok) {
        Napi::Error::New(env, "Failed to query image encoders size").ThrowAsJavaScriptException();
    }

    auto buffer = reinterpret_cast<ImageCodecInfo*>(new uint8_t[size]);
    codecsInfo = {{buffer, count}};

    if (Gdiplus::GetImageEncoders(count, size, codecsInfo->data()) != Status::Ok) {
        Napi::Error::New(env, "Failed to query image encoders").ThrowAsJavaScriptException();
    }

    return env.Undefined();
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
    exports.Set(Napi::String::New(env, "getThumbnail"), Napi::Function::New(env, GetIconBuffer));
    exports.Set(Napi::String::New(env, "init"), Napi::Function::New(env, InitLibrary));

    return exports;
}

NODE_API_MODULE(GetIcon, Init)