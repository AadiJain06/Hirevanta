import { env } from "@/lib/env";

/**
 * Organization structured data. Only factual fields are included — no invented
 * ratings, founding dates, employee counts, or social profiles.
 */
export function JsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "HireVanta",
    description:
      "Recruitment and talent acquisition agency connecting professionals with companies building the future.",
    url: env.appUrl,
    email: "hirevanta0@gmail.com",
  };
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
