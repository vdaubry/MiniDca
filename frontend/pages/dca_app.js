import AppHeader from "../components/AppHeader";
import Funding from "../components/Funding";
import Withdrawing from "../components/Withdrawing";

export default function DcaApp() {
  return (
    <div>
      <AppHeader />
      <Funding />
      <Withdrawing />
    </div>
  );
}
