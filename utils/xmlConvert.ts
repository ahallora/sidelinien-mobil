import xml2js from "xml2js";

/**
 * Convert XML string to a JavaScript object using xml2js.
 */
export default async function xmlConvert(xml: string): Promise<object | null> {
  return new Promise((resolve) => {
    xml2js.parseString(xml, (err: Error | null, result: object) => {
      if (err) {
        console.error("[xmlConvert] parse error:", err.message);
        return resolve(null);
      }
      resolve(result);
    });
  });
}
