import type { Metadata } from "next";
import { LegalLayout } from "@/components/site/LegalLayout";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How HireVanta collects, uses, and protects your data.",
};

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" updated="October 2026">
      <p>
        This policy explains how HireVanta handles the information you share when
        you apply for a role or send us a message. We collect only what we
        need to process your request.
      </p>
      <h2>Information we collect</h2>
      <p>
        For candidates: your name, contact details, location, professional
        details, and the résumé you upload. If you contact us through the website
        form: your name, email, and the message you send.
      </p>
      <h2>How we use it</h2>
      <p>
        We use your information solely to review applications, respond to your
        messages, and communicate with you about opportunities. We do not sell
        your personal data.
      </p>
      <h2>Résumé storage</h2>
      <p>
        Résumés are stored in private, access-controlled storage. They are never
        made publicly accessible and are only viewed by authorized members of our
        team through secure, time-limited links.
      </p>
      <h2>Data retention &amp; deletion</h2>
      <p>
        We retain application data only as long as necessary for recruitment
        purposes, in line with our configurable retention policy. To request
        access to or deletion of your data, email{" "}
        <a href="mailto:hirevanta0@gmail.com">hirevanta0@gmail.com</a>.
      </p>
      <h2>Your consent</h2>
      <p>
        By submitting an application, you consent to the processing of your data
        as described here. You may withdraw consent at any time by contacting us.
      </p>
      <h2>Contact</h2>
      <p>
        Questions about this policy? Email{" "}
        <a href="mailto:hirevanta0@gmail.com">hirevanta0@gmail.com</a>.
      </p>
    </LegalLayout>
  );
}
