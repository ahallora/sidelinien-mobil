import { NextApiRequest, NextApiResponse } from "next";
import getPage from "../../utils/chromium";

export default async function TestEndpoint(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const page = await getPage();
    await page.goto("https://dummyjson.com/products/1", {
      waitUntil: "networkidle2",
    });

    res.json({ yay: "🥳" });
  } catch (e) {
    console.log(e);
    res.json({ error: e?.message ?? e });
  }
}
