import CenterOnLgScreen from "@/common/utils/CenterOnLgScreen";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description:
    "Review StackTrails’ terms and conditions to understand the rules and responsibilities of using our platform.",
  alternates: {
    canonical: "https://stacktrails.com/site/terms-and-conditions",
  },
  openGraph: {
    title: "Terms and Conditions | StackTrails",
    description:
      "Learn the terms that govern your use of StackTrails and our services.",
    url: "https://stacktrails.com/site/terms-and-conditions",
  },
};

export default function TermsPage() {
  return (
    <CenterOnLgScreen
      element="main"
      className="prose prose-neutral !max-w-[100ch]   py-10"
    >
      <h1 className="text-center text-3xl font-bold mb-8 text-accent">
        Terms of Use
      </h1>

      <p>
        <strong>Last Updated:</strong> October 13, 2025
      </p>

      <h2>AGREEMENT TO OUR LEGAL TERMS</h2>
      <p>
        Welcome to <strong>StackTrails</strong> (“Company,” “we,” “us,” or
        “our”).
      </p>
      <p>
        StackTrails provides a digital learning platform that allows users to
        share, view, and manage learning materials, including links to
        documents, videos, and resources hosted on third-party services (the
        “Services”).
      </p>
      <p>
        You can contact us by email at{" "}
        <a href="mailto:support@stacktrails.com" className="text-primary">
          support@stacktrails.com
        </a>
        .
      </p>
      <p>
        These Terms of Use (“Terms”) form a binding agreement between you (“you”
        or “user”) and <strong>StackTrails</strong> regarding your access to and
        use of our Services.
      </p>
      <p>
        By using StackTrails, you confirm that you have read, understood, and
        agree to be bound by these Terms. If you do not agree, you must stop
        using the Services immediately.
      </p>
      <p>
        We may update these Terms periodically. Changes will be reflected by
        updating the “Last Updated” date above. Continued use of StackTrails
        after any changes constitutes your acceptance of the revised Terms.
      </p>

      <h2>1. OUR SERVICES</h2>
      <p>
        StackTrails is designed to support knowledge sharing through educational
        materials. Users can upload or share{" "}
        <strong>links to external documents, videos, and resources</strong>, but
        StackTrails does <strong>not host or own third-party content</strong>.
      </p>
      <p>
        Users are responsible for ensuring that the materials they share comply
        with copyright laws, are safe to access, and do not contain malicious
        links or harmful content.
      </p>
      <p>
        Access to StackTrails may not be lawful in all jurisdictions. If you
        access the Services from outside Nigeria, you do so at your own risk and
        are responsible for compliance with local laws.
      </p>

      <h2>2. INTELLECTUAL PROPERTY RIGHTS</h2>
      <p>
        All intellectual property rights in the StackTrails platform, including
        the software, design, logos, text, and code, are owned or licensed by{" "}
        <strong>StackTrails</strong>.
      </p>
      <p>
        You may access and use our Services for personal or educational purposes
        only. You may not reproduce, sell, or exploit any part of StackTrails
        without our prior written consent.
      </p>
      <p>
        You retain ownership of any content you create or upload, but by sharing
        it through StackTrails, you grant us a non-exclusive, worldwide,
        royalty-free license to display, distribute, and promote your content as
        part of the Service.
      </p>

      <h2>3. USER REPRESENTATIONS</h2>
      <ul>
        <li>You are at least 16 years old or have parental consent.</li>
        <li>
          You will use the Services only for lawful and educational purposes.
        </li>
        <li>
          You will not upload or share any harmful, misleading, or malicious
          materials.
        </li>
        <li>
          You will respect other users and maintain a positive community
          environment.
        </li>
      </ul>
      <p>
        We reserve the right to suspend or terminate accounts that violate these
        Terms.
      </p>

      <h2>4. PROHIBITED ACTIVITIES</h2>
      <ul>
        <li>
          Post or share malicious or misleading links, including phishing or
          malware.
        </li>
        <li>Upload copyrighted material without permission.</li>
        <li>Use StackTrails for harassment, abuse, or hate speech.</li>
        <li>Attempt to hack, overload, or disrupt the Services.</li>
        <li>
          Use StackTrails to promote commercial or political content unrelated
          to learning.
        </li>
      </ul>

      <h2>5. USER-GENERATED CONTRIBUTIONS</h2>
      <p>Users may contribute links, notes, and other educational resources.</p>
      <p>
        You represent that you own or have permission to share all materials you
        contribute and that they do not violate any third-party rights.
      </p>
      <p>
        StackTrails reserves the right to remove any content that is offensive,
        unsafe, or violates these Terms.
      </p>

      <h2>6. CONTRIBUTION LICENSE</h2>
      <p>
        By posting or sharing content through StackTrails, you grant us
        permission to display and distribute it within our platform for
        educational purposes.
      </p>
      <p>
        We do not claim ownership of your content, but we may modify or remove
        it for clarity, safety, or compliance.
      </p>

      <h2>7. THIRD-PARTY CONTENT AND LINKS</h2>
      <p>
        StackTrails may contain links to external sites like YouTube, Dropbox,
        or Google Drive. These third-party services are not owned or controlled
        by StackTrails.
      </p>
      <p>
        We are not responsible for the content, privacy, or security practices
        of external links shared by users. You access such links at your own
        risk.
      </p>

      <h2>8. TERMINATION</h2>
      <p>
        We may suspend or terminate your access to StackTrails at any time if we
        believe you have violated these Terms.
      </p>
      <p>
        Termination does not affect any legal obligations or rights that have
        already accrued.
      </p>

      <h2>9. DISCLAIMER</h2>
      <p>
        StackTrails is provided “as is” and “as available.” We make no
        warranties, express or implied, regarding the reliability, safety, or
        availability of third-party materials shared on the platform.
      </p>
      <p>
        You are encouraged to exercise caution before accessing or downloading
        any user-shared links.
      </p>

      <h2>10. LIMITATION OF LIABILITY</h2>
      <p>
        To the fullest extent permitted by law, StackTrails shall not be liable
        for any indirect, incidental, or consequential damages, including but
        not limited to data loss, malware infections, or misuse of third-party
        links shared by users.
      </p>
      <p>Your use of StackTrails is entirely at your own risk.</p>

      <h2>11. INDEMNIFICATION</h2>
      <p>
        You agree to indemnify and hold harmless StackTrails, its team members,
        and affiliates against any claims, damages, or losses arising from:
      </p>
      <ul>
        <li>Your violation of these Terms,</li>
        <li>Your uploaded content, or</li>
        <li>Any misuse of the platform.</li>
      </ul>

      <h2>12. GOVERNING LAW</h2>
      <p>
        These Terms are governed by the laws of the Federal Republic of Nigeria.
        Disputes will be resolved exclusively in the courts of Lagos, Nigeria.
      </p>

      <h2>13. CONTACT US</h2>
      <p>
        For any questions, partnership inquiries, or complaints, please contact
        us at:
      </p>
      <p>
        📧{" "}
        <a href="mailto:support@stacktrails.com" className="text-primary">
          support@stacktrails.com
        </a>
      </p>
    </CenterOnLgScreen>
  );
}
