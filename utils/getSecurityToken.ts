import getPage from "./chromium";

const getCookieValue = (arr: any[], cookieName: string) =>
  arr.find((x) => x.name === cookieName)
    ? arr.find((x) => x.name === cookieName).value
    : null;

export default async function getSecurityToken(username: any, password: any) {
  try {
    const loginPage =
      "http://sidelinien.dk/forums/search.php?do=getnew&contenttype=vBForum_Event"; // hack to get to the vbform login

    let error;
    const page = await getPage();

    const agent =
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36";
    page.setUserAgent(agent);

    await page.goto(loginPage);
    await page.waitForSelector("#vb_login_username");
    await page.focus("#vb_login_username");

    await page.type("#vb_login_username", username);
    await page.type("#vb_login_password", password);
    await page.click("#cb_cookieuser"); // check this to save id and password hash to cookies so we can get it

    await Promise.all([
      page.click("form.vbform input[type='submit']"),
      page.waitForNavigation({ waitUntil: "networkidle0" }),
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

    // get security token from page (expires after 15 minutes)
    let securitytoken = await page.evaluate(() => {
      //@ts-ignore
      return SECURITYTOKEN.toString();
    });

    // grab page cookies and extract userid and password
    const client = await page.target().createCDPSession();
    const cookies = (await client.send("Network.getAllCookies")).cookies;

    const data = {
      securitytoken,
      bb_sessionhash: getCookieValue(cookies, "bb_sessionhash"),
      bb_userid: getCookieValue(cookies, "bb_userid"),
      bb_password: getCookieValue(cookies, "bb_password"),
    };

    await page.close();
    return data;
  } catch (err) {
    console.error(err);
    throw err;
  }
}
