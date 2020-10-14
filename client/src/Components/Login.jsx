import React, { useState, useEffect, Fragment } from "react";
import axios from "axios";
import { useCallback } from "react";
import "./../Styles/Shouts.css";

export default function Login(props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loggedIn, setLoggedIn] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [shouts, setShouts] = useState([]);
  const [sticky, setSticky] = useState([]);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const doLogin = async () => {
    if (username && password) {
      await grabShouts();
      setLoggedIn(true);
    }
  };

  const doLogout = async () => {
    console.log("do log out");

    if (window.confirm("Vil du gerne logge ud?")) {
      setLoggedIn(false);
      setPassword("");
      setUsername("");
      setShouts([]);
      setSticky([]);
      setLastUpdate(null);
    }
  };

  const sleep = async ms => await new Promise(r => setTimeout(r, ms));

  const doSend = async () => {
    setIsSending(true);
    console.log("send message", message);

    // do stuff here
    await sleep(2000);

    setMessage("");
    setIsSending(false);
  };

  const grabShouts = useCallback(async () => {
    const res = await axios({
      url: "http://localhost:4000/getshouts",
      headers: {
        Authorization: "Basic " + window.btoa(username + ":" + password)
      }
    });

    console.log(res.data);

    setShouts(res.data.vbshout.shouts[0].shout);
    setSticky(res.data.vbshout.sticky[0]);
    setLastUpdate(Date.now());
  }, [password, username]);

  useEffect(() => {
    if (lastUpdate !== null && loggedIn) setTimeout(grabShouts, 6000);
  }, [lastUpdate, grabShouts, loggedIn]);

  const createMarkup = str => {
    return { __html: str };
  };

  const toRGB = str => {
    var hash = 0;
    if (str.length === 0) return hash;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
      hash = hash & hash;
    }
    var rgb = [0, 0, 0];
    for (let i = 0; i < 3; i++) {
      var value = (hash >> (i * 8)) & 255;
      rgb[i] = value;
    }
    return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
  };
  return (
    <Fragment>
      {loggedIn ? (
        <Fragment>
          <div className="header">
            <h1>Sidelinien</h1>
            <div className="updateTime">
              {new Date(lastUpdate).toLocaleTimeString()}
            </div>
            <button onClick={e => doLogout()}>&times; Log ud</button>
          </div>

          <div className="shoutContainer">
            {sticky &&
              sticky
                .filter(x => x !== `""`)
                .map((stickyPost, spIndex) => (
                  <div className="stickyPost" key={spIndex}>
                    {JSON.stringify(stickyPost)}
                  </div>
                ))}

            {shouts &&
              shouts
                .map((curr, index, array) => {
                  const next = array[index + 1] || null;
                  const time =
                    next && curr.time[0] === next.time[0] ? null : curr.time[0];
                  return {
                    userid: curr.userid[0],
                    id: curr.shoutid[0],
                    time: time && time.replace(/\[|\]/gi, ""),
                    name: curr.jsusername[0],
                    message: curr.message[0],
                    color: toRGB(curr.jsusername[0]),
                    type: curr.template[0]
                  };
                })
                .map(shout => (
                  <div
                    className={`shout ${shout.type === "me" ? " notice" : ""}`}
                    key={shout.id}
                  >
                    {shout.time && <div className="time">{shout.time}</div>}
                    <div
                      className={`message${
                        shout.userid === username ? " self" : ""
                      }`}
                      style={{ borderColor: shout.color }}
                    >
                      <div className="author">{shout.name}</div>
                      <div
                        className="messageContent"
                        dangerouslySetInnerHTML={createMarkup(shout.message)}
                      />
                    </div>
                  </div>
                ))}
          </div>

          <div className="footer">
            <input
              type="text"
              className="inputField"
              disabled={isSending}
              placeholder="Din besked"
              autoComplete="false"
              onChange={e => setMessage(e.target.value)}
              value={message}
            />
            <button
              className="primary"
              disabled={isSending}
              onClick={e => doSend()}
            >
              {isSending ? "Sender..." : "Send"}
            </button>
          </div>
        </Fragment>
      ) : (
        <div className="loginContainer">
          <h1>Sidelinien Mobil</h1>
          <p>Vær med i "skakten" på din mobil - uden alt besværet</p>
          <form
            onSubmit={e => {
              doLogin(e);
              e.preventDefault();
              return false;
            }}
          >
            <input
              className="inputField"
              type="text"
              placeholder="Brugernavn"
              autoComplete="username"
              onChange={e => setUsername(e.target.value)}
              value={username}
            />
            <input
              className="inputField"
              type="password"
              autoComplete="current-password"
              placeholder="Password"
              onChange={e => setPassword(e.target.value)}
              value={password}
            />
            <br />

            <button className="primary" type="submit">
              Log ind
            </button>
          </form>
        </div>
      )}
    </Fragment>
  );
}
