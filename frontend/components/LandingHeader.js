import Link from "next/link";

export default function LandingHeader() {
  return (
    <nav className="p-5 border-b-2">
      <div className="container mx-auto px-6 py-2 flex justify-between items-center">
        <Link href="/" className="font-bold text-2xl lg:text-4xl">
          Minimalist DCA
        </Link>
        <div className="hidden lg:block">
          <ul className="inline-flex">
            <li>
              <Link className="px-4 font-bold" href="/">
                Home
              </Link>
            </li>
            <li>
              <a
                className="px-4 hover:text-gray-800"
                href="https://github.com/vdaubry/MiniDca"
              >
                Contact
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
