import Link from "next/link";

function Header(): JSX.Element {
  return (
    <Link href="/">
      <a>
        <h1 className="text-center font-bold text-6xl my-5">Ugolki</h1>
      </a>
    </Link>
  );
}

export default Header;
