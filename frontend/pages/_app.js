import "../styles/globals.css";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { MoralisProvider } from "react-moralis";

config.autoAddCss = false;

function MyApp({ Component, pageProps }) {
  return (
    <MoralisProvider initializeOnMount={false}>
      <Component {...pageProps} />;
    </MoralisProvider>
  );
}

export default MyApp;
