import xml2js from "xml2js";

/**
 * Convert XML string to a JavaScript object using xml2js.
 */
export default async function xmlConvert(xml: string): Promise<object> {
  return new Promise((resolve, reject) => {
    xml2js.parseString(xml, (err: Error | null, result: object) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
}
