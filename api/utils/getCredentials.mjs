import puppeteer from "puppeteer";

export default async function getCredentials(username, password) {
  const loginPage = "http://sidelinien.dk/forums/";

  let error;
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(loginPage);

  await page.evaluate(
    (username, password) => {
      document.querySelector("#navbar_username").value = username;
      document.querySelector("#navbar_password").value = password;
    },
    { username, password }
  );


  await Promise.all([
    page.click("#navbar_loginform .loginbutton"),
    page.waitForNavigation()
  ]);

  const finalPage = page.url();
  console.log("New Page URL:", finalPage);

  // check if the login fails (and try to extract error)
  if (finalPage.indexOf("&do=login") > -1) {
    error = await page.evaluate(() => {
      return document.querySelector(".standard_error").innerText;
    });
    error =
      error && error.innerText
        ? error.innerText
        : "Generisk fejl - fortæl os det!";
  }
  if (error) throw Error(error);

  // grab page cookies and extract userid and password
  const cookies = await page.cookies();
  console.log(cookies);

  await browser.close();

  return {
    cookies: cookies.map(x => {
      return { name: x.name, value: x.value };
    }),
    username: "naa",
    password: "na"
  };
}
