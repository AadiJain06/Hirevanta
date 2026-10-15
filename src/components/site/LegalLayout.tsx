import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { AmbientBackground } from "@/components/ui/AmbientBackground";

export function LegalLayout({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <AmbientBackground />
      <Navbar />
      <main className="px-5 pb-20 pt-32 sm:px-8">
        <div className="container-max max-w-3xl">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-slate-400 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white">
            {title}
          </h1>
          <p className="mt-2 text-sm text-slate-500">Last updated: {updated}</p>
          <div className="prose-invert mt-8 space-y-6 text-sm leading-relaxed text-slate-400 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-white [&_a]:text-violetx-soft [&_a]:underline">
            {children}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
