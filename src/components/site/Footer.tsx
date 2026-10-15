import Link from "next/link";
import { Mail } from "lucide-react";
import { Logo } from "@/components/brand/Logo";

const CONTACT = "hirevanta0@gmail.com";

const columns = [
  {
    heading: "Navigate",
    links: [
      { label: "Home", href: "/#home" },
      { label: "Find Jobs", href: "/#jobs" },
      { label: "About Us", href: "/#about" },
      { label: "Contact", href: "/#contact-form" },
    ],
  },
  {
    heading: "Candidates",
    links: [
      { label: "Browse Roles", href: "/#jobs" },
      { label: "Apply Now", href: "/#jobs" },
      { label: "Privacy Policy", href: "/privacy" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About HireVanta", href: "/#about" },
      { label: "Contact Us", href: "/#contact-form" },
      { label: "Terms of Use", href: "/terms" },
    ],
  },
];

export function Footer() {
  return (
    <footer id="contact" className="border-t border-white/10 px-5 py-16 sm:px-8">
      <div className="container-max">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">
              HireVanta connects ambitious professionals with companies building
              the future — through thoughtful, people-first recruitment.
            </p>
            <a
              href={`mailto:${CONTACT}`}
              className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-slate-300 transition hover:text-white"
            >
              <Mail className="h-4 w-4 text-violetx-soft" />
              {CONTACT}
            </a>
          </div>

          {columns.map((col) => (
            <div key={col.heading}>
              <h4 className="text-sm font-semibold text-white">{col.heading}</h4>
              <ul className="mt-4 space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-slate-400 transition hover:text-white"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-slate-500 sm:flex-row">
          <p>© {new Date().getFullYear()} HireVanta. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <Link href="/privacy" className="transition hover:text-white">Privacy Policy</Link>
            <Link href="/terms" className="transition hover:text-white">Terms of Use</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
