import { NextApiRequest, NextApiResponse } from "next";
import randUserAgent from "rand-user-agent";
import getPage from "../../utils/chromium";

export default async function TestEndpoint(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const loginPage =
      "https://sidelinien.dk/forums/search.php?do=getnew&contenttype=vBForum_Event"; // hack to get to the vbform login

    const page = await getPage();
    const agent = randUserAgent("desktop", "chrome", "linux");
    await page.setUserAgent(agent);
    await page.goto(loginPage, { waitUntil: "networkidle2" });

    res.json({ content: JSON.stringify(await page.content()) });
  } catch (e) {
    console.log(e);
    res.json({ error: e?.message ?? e });
  }
}
