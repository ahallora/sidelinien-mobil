import puppeteer from "puppeteer";

const sleep = async (ms: number) => await new Promise(r => setTimeout(r, ms));

const getCookieValue = (arr: any[], cookieName: string) =>
  arr.find(x => x.name === cookieName)
    ? arr.find(x => x.name === cookieName).value
    : null;

export default async function getCredentials(username: any, password: any) {
  try {
    const loginPage =
      "http://sidelinien.dk/forums/search.php?do=getnew&contenttype=vBForum_Event"; // hack to get to the vbform login

    let error;
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(loginPage, { waitUntil: "networkidle2" });
    //await page.setViewport({ width: 1200, height: 720 });

    await page.type("#vb_login_username", username);
    await page.type("#vb_login_password", password);
    await page.click("#cb_cookieuser"); // check this to save id and password hash to cookies so we can get it

    await Promise.all([
      page.click("form.vbform input[type='submit']"),
      page.waitForNavigation({ waitUntil: "networkidle0" })
    ]);

    // check if the login fails (and try to extract error)
    if (page.url().indexOf("&do=login") > -1) {
      error = await page.evaluate(() => {
        // @ts-ignore
        return document.querySelector(".standard_error").innerText;
      });
      error =
        error && error.innerText
          ? error.innerText
          : "Generisk fejl - fortæl os det!";
    }
    if (error) throw Error(error);

    // grab page cookies and extract userid and password
    const client = await page.target().createCDPSession();
    const cookies = (await client.send("Network.getAllCookies")).cookies;

    const data = {
      bb_sessionhash: getCookieValue(cookies, "bb_sessionhash"),
      bb_userid: getCookieValue(cookies, "bb_userid"),
      bb_password: getCookieValue(cookies, "bb_password")
    };

    await browser.close();
    return data;
  } catch (err) {
    console.error(err);
    throw err;
  }
}
