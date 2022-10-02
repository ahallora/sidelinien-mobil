import { NextApiRequest, NextApiResponse } from "next";
import getPage from "../../utils/chromium";

export default async function TestEndpoint(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const page = await getPage();
    const loginPage =
      "http://sidelinien.dk/forums/search.php?do=getnew&contenttype=vBForum_Event"; // hack to get to the vbform login
    await page.goto(loginPage);

    res.json({ content: JSON.stringify(await page.content()) });
  } catch (e) {
    console.log(e);
    res.json({ error: e?.message ?? e });
  }
}
