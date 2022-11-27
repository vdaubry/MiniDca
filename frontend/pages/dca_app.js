import AppHeader from "../components/AppHeader";
import Funding from "../components/Funding";
import Withdrawing from "../components/Withdrawing";
import CurrentInvestment from "../components/CurrentInvestment";
import { useEffect, useState } from "react";

export default function DcaApp() {
  const [currentInvestment, setCurrentInvestment] = useState("0");

  return (
    <div>
      <AppHeader />
      <CurrentInvestment />
      <Funding />
      <Withdrawing />
    </div>
  );
}
