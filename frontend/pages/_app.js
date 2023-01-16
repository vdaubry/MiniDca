import "../styles/globals.css";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { NotificationProvider } from "web3uikit";
import { WagmiConfig } from "wagmi";
import { client } from "../utils/wagmi";
import { ConnectKitProvider } from "connectkit";

import Head from "next/head";

config.autoAddCss = false;

function MiniDCA({ Component, pageProps }) {
  return (
    <div>
      <Head>
        <title>Minimalist Dca</title>
        <meta name="description" content="Dca" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <WagmiConfig client={client}>
        <ConnectKitProvider>
          <NotificationProvider>
            <Component {...pageProps} />
          </NotificationProvider>
        </ConnectKitProvider>
      </WagmiConfig>
    </div>
  );
}

export default MiniDCA;
