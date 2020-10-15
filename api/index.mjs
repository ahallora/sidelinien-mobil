import bodyParser from "body-parser";
import bodyParserXml from "body-parser-xml";
//import md5 from "./utils/md5.mjs";
import ws from "ws";
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
app.use(bodyParser.json());
app.use(express.static(DIRNAME + "/../client/build"));
app.use(
  cors({
    origin: "*"
  })
);

const port = 4000;

const getCredentialsFromHeader = headers => {
  try {
    const [bb_userid, bb_password] = new Buffer(
      headers["authorization"].split("Basic ")[1],
      "base64"
    )
      .toString("ascii")
      .split(":");

    return { bb_userid, bb_password };
  } catch (e) {
    return false;
  }
};

app.get("/", function(req, res) {
  res.sendFile(path.join(DIRNAME + "/index.html")); // send from static files
});

app.get("/getshouts", async (req, res) => {
  try {
    const { bb_userid, bb_password } = getCredentialsFromHeader(req.headers);
    if (!bb_userid || !bb_password) throw Error("Invalid credentials");

    const output = await getShouts(bb_userid, bb_password);
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
    const { username, password } = req.body;
    const result = await getCredentials(username, password);
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

////////////////////////////////////

function noop() {}
function heartbeat() {
  this.isAlive = true;
}
const wss = new ws.Server({ noServer: true });

wss.on("connection", (socket, req) => {
  socket.id = req.headers["sec-websocket-key"];
  socket.isAlive = true;
  socket.on("pong", heartbeat);
  socket.on("message", message => console.log(message));

  console.log("new connection", socket.id);
  console.log("active connections", wss.clients.size);
});

const interval = setInterval(function ping() {
  for (let socket of wss.clients) {
    if (socket.isAlive) {
      socket.send(
        JSON.stringify({ status: "active connections: " + wss.clients.size })
      );
    }
    if (socket.isAlive === false) return socket.terminate();
    socket.isAlive = false;
    socket.ping(noop);
  }
}, 1000);

wss.on("close", function close() {
  console.log("disconnected");
  clearInterval(interval);
  close();
});

wss.on("listening", socket => {
  console.log("listening", socket);
});

const server = app.listen(port + 443);
server.on("upgrade", (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, socket => {
    wss.emit("connection", socket, request);
  });
});
