import { useEffect, useCallback } from "react";

export default function ErrorBox(props: any) {
  const { errorText, cb } = props;
  let timerFnc: any = useCallback(() => cb(""), [cb]);

  useEffect(() => {
    clearTimeout(timerFnc);
    setTimeout(timerFnc, 5000);
  }, [errorText, timerFnc]);

  return errorText === "" ? (
    <div></div>
  ) : (
    <div className="errorBox">{errorText}</div>
  );
}
