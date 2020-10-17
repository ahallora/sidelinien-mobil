import React, { useEffect, useCallback } from "react";
import "./../Styles/ErrorBox.css";

export default function ErrorBox({ errorText, cb }) {
  let timerFnc = useCallback(() => cb(""), [cb]);

  useEffect(() => {
    clearTimeout(timerFnc);
    setTimeout(timerFnc, 5000);
  }, [errorText, timerFnc]);

  return errorText === "" ? "" : <div className="errorBox">{errorText}</div>;
}
