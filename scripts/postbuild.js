import fs from "fs/promises";
import cp from "child_process";
import chalk from "chalk";

const gitTag = cp
  .execSync("git describe --tags --abbrev=0")
  .toString()
  .trim()
  .replace("v", "");

async function example() {
  try {
    const dir = await fs.readdir("./dist/assets");
    const files = dir.filter((fn) => fn.endsWith(".js"));
    const file = files[0];

    const pathToFile = `./dist/assets/${file}`;

    const data = await fs.readFile(pathToFile, { encoding: "utf8" });
    const content = data.replace("GITTAG", gitTag);

    await fs.writeFile(pathToFile, content);

    console.log(
      `gitTag ${chalk.green(gitTag)} written to ${chalk.green(file)}`,
    );
  } catch (err) {
    console.log(err);
  }
}
example();
