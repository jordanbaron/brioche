"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="flex items-center justify-between border-b border-border bg-background-secondary px-6 py-4">
      <div>
        <h1 className="text-xl font-bold text-foreground">
          Brioche
        </h1>
        <p className="text-sm text-foreground-muted">
          Document to Markdown OCR
        </p>
      </div>
      <nav className="flex gap-4">
        <Link
          href="/"
          className={`text-sm font-medium transition-colors ${
            pathname === "/"
              ? "text-foreground"
              : "text-foreground-muted hover:text-foreground"
          }`}
        >
          Upload
        </Link>
        <Link
          href="/dashboard"
          className={`text-sm font-medium transition-colors ${
            pathname === "/dashboard"
              ? "text-foreground"
              : "text-foreground-muted hover:text-foreground"
          }`}
        >
          Dashboard
        </Link>
      </nav>
    </header>
  );
}
