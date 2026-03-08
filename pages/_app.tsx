import "../Styles/ErrorBox.css";
import "@/Styles/globals.css";
import "@/Styles/Shouts.css";
import type { AppProps } from "next/app";
import { ThemeProvider } from "@/Components/ThemeProvider";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <Component {...pageProps} />
    </ThemeProvider>
  );
}
