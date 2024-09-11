import "../styles/global.css";
import Layout from "../components/layout";
import { Courier_Prime } from "next/font/google";

export default function App({ Component, pageProps }) {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}
