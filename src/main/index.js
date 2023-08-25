import { app, shell, BrowserWindow, ipcMain } from "electron";
import { join } from "path";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import icon from "../../resources/icon.png?asset";

function createWindow() {
  // We cannot require the screen module until the app is ready.
  const { screen } = require("electron");

  // Create a window that fills the screen's available work area.
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.size;

  // Create the splash window.
  const splashWindow = new BrowserWindow({
    width: (width / 1920) * 600,
    height: (height / 1080) * 400,
    show: false,
    center: true,
    transparent: true,
    frame: false,
    resizable: false,
    movable: false,
    enableLargerThanScreen: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false,
    },
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    splashWindow.loadURL(
      process.env["ELECTRON_RENDERER_URL"] + "/splashscreen.html"
    );
  } else {
    splashWindow.loadFile(join(__dirname, "../renderer/splashscreen.html"));
  }

  splashWindow.on("ready-to-show", () => {
    splashWindow.show();
  });

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: (width / 1920) * 1080,
    height: (height / 1080) * 650,
    minWidth: (width / 1920) * 1080,
    minHeight: (height / 1080) * 650,
    show: false,
    center: true,
    enableLargerThanScreen: false,
    autoHideMenuBar: true,
    ...(process.platform === "linux" ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false,
    },
    icon: join(__dirname, "../../resources/icon.png"),
  });

  // Hide the splash window when the main window is ready-to-show
  // and show the main window when it finishes loading.
  mainWindow.once("ready-to-show", () => {
    splashWindow.hide();
    mainWindow.show();
    splashWindow.close();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId("com.electron");

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  let dockWindow = null;

  ipcMain.on("openDockWindow", () => {
    if (dockWindow) {
      dockWindow.show();
      return;
    }
    // We cannot require the screen module until the app is ready.
    const { screen } = require("electron");

    // Create a window that fills the screen's available work area.
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.size;

    dockWindow = new BrowserWindow({
      width: width * 0.5,
      height: height * 0.15,
      x: width * 0.25,
      y: height * 0.75,
      show: false,
      transparent: true,
      frame: false,
      resizable: false,
      movable: false,
      enableLargerThanScreen: false,
      autoHideMenuBar: true,
      webPreferences: {
        preload: join(__dirname, "../preload/index.js"),
        sandbox: false,
      },
    });

    // HMR for renderer base on electron-vite cli.
    // Load the remote URL for development or the local html file for production.
    if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
      dockWindow.loadURL(process.env["ELECTRON_RENDERER_URL"] + "/#/test");
    } else {
      dockWindow.loadFile(join(__dirname, "../renderer/index.html/"),{
        hash: "/test"
      });
    }

    dockWindow.on("ready-to-show", () => {
      dockWindow.show();
    });
  });

  ipcMain.on("closeDockWindow", () => {
    if (dockWindow) {
      dockWindow.close();
      dockWindow = null;
    }
  });

  ipcMain.on("relaunchApp", () => {
    app.relaunch();
    app.exit();
  });

  createWindow();

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
