import bodyParser from "body-parser";
import bodyParserXml from "body-parser-xml";
import md5 from "./utils/md5.mjs";
import xmlConvert from "./utils/xmlConvert.mjs";
import getShouts from "./utils/getShouts.mjs";
import express from "express";
import cors from "cors";
import path from "path";
import getCredentials from "./utils/getCredentials.mjs";

/** @todo Replace with import.meta eventually */
const FILENAME =
  typeof __filename !== "undefined"
    ? __filename
    : (/^ +at (?:file:\/*(?=\/)|)(.*?):\d+:\d+$/m.exec(Error().stack) || "")[1];
const DIRNAME =
  typeof __dirname !== "undefined"
    ? __dirname
    : FILENAME.replace(/[\/\\][^\/\\]*?$/, "");

const app = express();
bodyParserXml(bodyParser);
app.use(bodyParser.xml());
app.use(express.static(DIRNAME + "/../client/build"));
app.use(
  cors({
    origin: "*"
  })
);

const port = 4000;
const username = "";
const password = "";

const getCredentialsFromHeader = headers => {
  try {
    const [username, password] = new Buffer(
      headers["authorization"].split("Basic ")[1],
      "base64"
    )
      .toString("ascii")
      .split(":");

    return { username, password };
  } catch (e) {
    return false;
  }
};

app.get("/", function(req, res) {
  res.sendFile(path.join(DIRNAME + "/index.html")); // send from static files
});

app.get("/getshouts", async (req, res) => {
  try {
    const { username, password } = getCredentialsFromHeader(req.headers);
    if (!username || !password) throw Error("Invalid credentials");

    const output = await getShouts(username, password);
    // const etag = md5(output);

    // if (etag === req.headers["if-none-match"]) {
    //   return clres.status(304).end();
    // } else {
    //   res.set({
    //     "cache-control": "max-age=5",
    //     ETag: etag
    //   });
    // }

    const jsonxml = await xmlConvert(output);
    if (!jsonxml) throw Error("Malformed data received");
    res
      .json(jsonxml)
      .status(200)
      .end();
  } catch (err) {
    res
      .send(err.message || err)
      .status(500)
      .end();
  }
});

app.post("/getcredentials", async function(req, res) {
  try {
    const { q_username, q_password } = req.body;
    const result = await getCredentials(q_username, q_password);
    res
      .json(result)
      .status(200)
      .end();
  } catch (err) {
    res
      .send(err.message || err)
      .status(500)
      .end();
  }
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
