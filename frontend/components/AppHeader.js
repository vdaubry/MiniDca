import { ConnectButton } from "web3uikit";
import Link from "next/link";

export default function AppHeader() {
  return (
    <nav>
      <div className="container mx-auto px-6 py-2 flex justify-between items-center">
        <Link href="/" className="font-bold text-2xl lg:text-4xl">
          Minimalist DCA
        </Link>
        <div class="hidden lg:block">
          <ConnectButton />
        </div>
      </div>
    </nav>
  );
}
