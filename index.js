const fs = require("fs-extra");
const cp = require("child_process");
const Octokit = require("@octokit/rest");
const octokit = new Octokit();
const glob = require("glob");

async function downloadLatestRelease() {
  const fileNames = glob.sync("./now.*.json");

  console.log("Deployment files found:", fileNames.join("\n"));

  const latest = await octokit.repos.getLatestRelease({
    owner: "gatewayapps",
    repo: "grayskull"
  });

  if (fs.existsSync("./grayskull")) {
    console.log("Removing previous Grayskull download");
    fs.removeSync("./grayskull");
  }

  console.log("Downloading latest release of Grayskull");
  cp.execSync(
    `git clone --branch ${latest.data.tag_name} https://github.com/gatewayapps/grayskull`,
    { stdio: "inherit" }
  );

  cp.execSync(`rm ./grayskull/yarn.lock`, { stdio: "inherit" });

  fileNames.forEach(fileName => {
    console.log(`Deploying for ${fileName}`);
    cp.execSync(`npx now ./grayskull -A ${fileName}`);
  });
}

downloadLatestRelease();
