import Link from "next/link";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden">
      {/* Energetic floating gradient blobs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <span className="blob blob-float left-[-6rem] top-[-4rem] size-72" style={{ background: "var(--royal)" }} />
        <span className="blob blob-float right-[-5rem] top-10 size-64" style={{ background: "var(--coral)", animationDelay: "1.5s" }} />
        <span className="blob blob-float bottom-[-6rem] left-1/3 size-80" style={{ background: "var(--cyan)", animationDelay: "3s" }} />
      </div>
      <header className="flex items-center justify-between px-5 py-5">
        <Link href="/" className="flex items-center gap-2">
          <span className="inline-flex size-8 items-center justify-center rounded-2xl grad-primary text-white clay-sm">
            <span className="text-sm font-black">P</span>
          </span>
          <span className="text-lg font-bold tracking-tight">{APP_NAME}</span>
        </Link>
        <ThemeToggle />
      </header>

      <main className="flex flex-1 items-center justify-center px-5 py-10">
        <div className="w-full max-w-md">{children}</div>
      </main>

      <footer className="px-5 py-6 text-center text-sm text-muted-foreground">
        {APP_TAGLINE}
      </footer>
    </div>
  );
}
