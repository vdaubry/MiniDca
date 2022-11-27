import "../styles/globals.css";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { MoralisProvider } from "react-moralis";
import { NotificationProvider } from "web3uikit";

import Head from "next/head";

config.autoAddCss = false;

function MyApp({ Component, pageProps }) {
  return (
    <div>
      <Head>
        <title>Minimalist Dca</title>
        <meta name="description" content="Dca" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <MoralisProvider initializeOnMount={false}>
        <NotificationProvider>
          <Component {...pageProps} />
        </NotificationProvider>
      </MoralisProvider>
    </div>
  );
}

export default MyApp;
