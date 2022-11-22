import "../styles/globals.css";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import Header from "../components/Header";
config.autoAddCss = false;

function MyApp({ Component, pageProps }) {
  return (
    <div>
      <Header />
      <Component {...pageProps} />;
    </div>
  );
}

export default MyApp;
