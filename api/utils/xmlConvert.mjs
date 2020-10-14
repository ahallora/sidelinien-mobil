import xml2js from "xml2js";

export default async function xmlConvert(xml) {
  return await new Promise((resolve, reject) =>
    xml2js.parseString(xml, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    })
  );
}
