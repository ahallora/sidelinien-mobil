import core from "puppeteer-core";
import chrome from "chrome-aws-lambda";

const exePath =
  process.platform === "win32"
    ? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
    : process.platform === "linux"
    ? "/usr/bin/google-chrome"
    : "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

interface Options {
  args: string[];
  executablePath: string;
  headless: boolean;
  ignoreHTTPSErrors?: boolean;
}

async function getOptions() {
  const isDev = process.env.NODE_ENV !== "production";

  let options: Options;
  if (isDev) {
    options = {
      args: [],
      executablePath: exePath,
      headless: false,
      ignoreHTTPSErrors: true,
    };
  } else {
    options = {
      args: chrome.args,
      executablePath: await chrome.executablePath,
      headless: false,
      ignoreHTTPSErrors: true,
    };
  }
  return options;
}

let _page: core.Page | null;
export default async function getPage() {
  if (_page) {
    return _page;
  }
  const options = await getOptions();
  const browser = await core.launch(options);
  _page = await browser.newPage();
  return _page;
}
