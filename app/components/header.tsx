"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
          Brioche
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Document to Markdown OCR
        </p>
      </div>
      <nav className="flex gap-4">
        <Link
          href="/"
          className={`text-sm font-medium transition-colors ${
            pathname === "/"
              ? "text-zinc-900 dark:text-zinc-100"
              : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          }`}
        >
          Upload
        </Link>
        <Link
          href="/dashboard"
          className={`text-sm font-medium transition-colors ${
            pathname === "/dashboard"
              ? "text-zinc-900 dark:text-zinc-100"
              : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          }`}
        >
          Dashboard
        </Link>
      </nav>
    </header>
  );
}
