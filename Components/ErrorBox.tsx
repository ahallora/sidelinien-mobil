import { useEffect, useRef } from "react";

interface ErrorBoxProps {
  errorText: string;
  cb: (value: string) => void;
}

export default function ErrorBox({ errorText, cb }: ErrorBoxProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    if (errorText) {
      timerRef.current = setTimeout(() => cb(""), 5000);
    }
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [errorText, cb]);

  if (!errorText) return null;

  return <div className="errorBox">{errorText}</div>;
}
