import Link from "next/link";

export default function Header() {
  return (
    <nav>
      <div className="container mx-auto px-6 py-2 flex justify-between items-center">
        <Link href="/" className="font-bold text-2xl lg:text-4xl">
          Minimalist DCA
        </Link>
        <div class="hidden lg:block">
          <ul class="inline-flex">
            <li>
              <a class="px-4 font-bold" href="/">
                Home
              </a>
            </li>
            <li>
              <a
                class="px-4 hover:text-gray-800"
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
