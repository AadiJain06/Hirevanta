import Link from "next/link";
import { AmbientBackground } from "@/components/ui/AmbientBackground";
import { Logo } from "@/components/brand/Logo";

export default function NotFound() {
  return (
    <>
      <AmbientBackground />
      <main className="flex min-h-screen flex-col items-center justify-center px-5 text-center">
        <Logo className="mb-8" />
        <p className="gradient-text text-7xl font-extrabold">404</p>
        <h1 className="mt-4 text-2xl font-bold text-white">Page not found</h1>
        <p className="mt-2 max-w-md text-sm text-slate-400">
          The page you&apos;re looking for doesn&apos;t exist or may have moved.
        </p>
        <Link
          href="/"
          className="mt-7 rounded-xl bg-brand-gradient px-6 py-3 text-sm font-semibold text-white shadow-glow"
        >
          Back to home
        </Link>
      </main>
    </>
  );
}
