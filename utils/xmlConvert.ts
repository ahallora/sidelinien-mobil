import xml2js from "xml2js";

export default async function xmlConvert(xml: string): Promise<object> {
  return await new Promise((resolve, reject) =>
    xml2js.parseString(xml, (err: any, result: any) => {
      if (err) return reject(err);
      resolve(result);
    })
  );
}
