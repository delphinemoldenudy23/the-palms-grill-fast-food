import { Toaster } from "react-hot-toast";
import "../styles/globals.css";

export default function App({ Component, pageProps }) {
  return (
    <>
      <Toaster position="top-center" />
      <Component {...pageProps} />
    </>
  );
}
