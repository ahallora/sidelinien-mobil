import React from "react";
import "./../Styles/ErrorBox.css";

export default function ErrorBox({ errorText }) {
  return <div className="errorBox">{errorText}</div>;
}
