import type { Metadata } from "next";
import { LegalLayout } from "@/components/site/LegalLayout";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "The terms governing your use of the HireVanta website.",
};

export default function TermsPage() {
  return (
    <LegalLayout title="Terms of Use" updated="October 2026">
      <p>
        By using the HireVanta website, you agree to these terms. Please read
        them carefully.
      </p>
      <h2>Use of the site</h2>
      <p>
        You agree to provide accurate information when applying for roles or
        submitting inquiries, and to use the site only for lawful recruitment and
        career purposes.
      </p>
      <h2>Sample listings</h2>
      <p>
        Job listings marked “Sample” are demonstration data and do not represent
        genuine vacancies. Only listings published by HireVanta administrators
        represent real opportunities.
      </p>
      <h2>Submissions</h2>
      <p>
        You are responsible for the content you submit, including your résumé and
        any supporting details. Do not upload content you are not authorized to
        share.
      </p>
      <h2>Availability</h2>
      <p>
        We aim to keep the site available and accurate but provide it on an
        “as is” basis without warranties of uninterrupted availability.
      </p>
      <h2>Contact</h2>
      <p>
        Questions about these terms? Email{" "}
        <a href="mailto:hirevanta0@gmail.com">hirevanta0@gmail.com</a>.
      </p>
    </LegalLayout>
  );
}
