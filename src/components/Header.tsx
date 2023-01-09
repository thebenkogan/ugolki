import Link from "next/link";

function Header(): JSX.Element {
  return (
    <Link href="/">
      <a>
        <h1 className="text-center font-bold text-5xl mt-5 mx-5">Ugolki</h1>
      </a>
    </Link>
  );
}

export default Header;
