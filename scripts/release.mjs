import { createRequire } from "module";
import { execSync } from "child_process";
import fs from "fs";

import updatelog from "./updatelog.mjs";

const require = createRequire(import.meta.url);

async function release()
{
  const flag = process.argv[2] ?? "patch";
  const packageJson = require("../package.json");
  let suffix = process.argv[3] ?? null;
  let [a, b, c] = packageJson.version.split("-")[0].split(".").map(Number);

  if (!suffix)
  {
    switch (flag)
    {
      case "major":
        a++;
        b = 0;
        c = 0;
        break;
      case "minor":
        b++;
        c = 0;
        break;
      case "patch":
        c++;
        break;
      case "premajor":
        a++;
        b = 0;
        c = 0;
        suffix = "beta";
        break;
      case "preminor":
        b++;
        c = 0;
        suffix = "beta";
        break;
      case "prepatch":
        c++;
        suffix = "beta";
        break;
      case "prerelease":
        suffix = "rc";
        break;
      default:
        console.log("Invalid flag");
        process.exit(1);
    }
  }

  const nextVersion = `${ a }.${ b }.${ c }`;
  packageJson.version = suffix ? `${ nextVersion }-${ suffix }` : nextVersion;

  // const nextTag = `v${ nextVersion }`;
  const nextTag = `v${ packageJson.version }`;
  await updatelog(nextTag, "release");

  // 将新版本写入 package.json 文件
  fs.writeFileSync("./package.json", JSON.stringify(packageJson, null, 2));

  // 提交修改的文件，打 tag 标签（tag 标签是为了触发 github action 工作流）并推送到远程
  execSync("git add ./package.json ./UPDATE_LOG.md");
  execSync(`git commit -m "${ nextTag }"`);
  execSync(`git tag -a ${ nextTag } -m "${ nextTag }"`);
  execSync(`git push`);
  execSync(`git push origin ${ nextTag }`);
  console.log(`Publish Successfully...`);
}

release().catch(console.error);
