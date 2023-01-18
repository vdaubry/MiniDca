import { ConnectKitButton } from "connectkit";
import Link from "next/link";

export default function AppHeader() {
  return (
    <nav className="p-5 border-b-2">
      <div className="container mx-auto px-6 py-2 flex justify-between items-center">
        <Link href="/" className="font-bold text-2xl lg:text-4xl">
          Minimalist DCA
        </Link>
        <div className="hidden lg:block">
          <ConnectKitButton />
        </div>
      </div>
    </nav>
  );
}
