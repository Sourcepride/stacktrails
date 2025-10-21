import CenterOnLgScreen from "@/common/utils/CenterOnLgScreen";

export default async function Page() {
  return (
    <CenterOnLgScreen element={"main"}>
      <div className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Privacy Policy
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Last Updated: October 20, 2025
        </p>
        <p className="text-gray-700 mb-6">
          This Privacy Policy (“Policy”) describes how{" "}
          <strong>Stacktrails</strong> (“we,” “us,” or “our”) collects, uses,
          stores, and shares (“process”) your personal information when you
          access or use our website, services, and related features
          (“Services”).
        </p>
        <p className="text-gray-700 mb-6">
          By using our Services, you agree to the collection and use of
          information in accordance with this Policy. If you do not agree with
          this Policy, please discontinue use of our Services.
        </p>

        {/* Table of Contents */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Table of Contents
          </h2>
          <ul className="list-none space-y-1 text-blue-600">
            {[
              "Overview",
              "Summary of Key Points",
              "Information We Collect",
              "How We Use Your Information",
              "Legal Basis for Processing",
              "Data Sharing",
              "Third-Party Links",
              "Cookies & Tracking Technologies",
              "AI-Powered Features",
              "Social Logins",
              "Data Retention",
              "Data Security",
              "Your Privacy Rights",
              "Do-Not-Track & Opt-Out Controls",
              "U.S. Residents’ Privacy Rights",
              "Policy Updates",
              "Contact Information",
              "Reviewing or Deleting Your Data",
            ].map((title, index) => (
              <li key={index}>
                <a href={`#section-${index + 1}`} className="hover:underline">
                  {index + 1}. {title}
                </a>
              </li>
            ))}
          </ul>
        </section>

        <PolicySection id="section-1" title="1. Overview">
          <p>
            Stacktrails is an open learning platform where communities create,
            organize, and share learning resources. Our vision is to make
            learning smarter, easier, and more collaborative through
            peer-to-peer interaction and AI-powered tools.
          </p>
          <p>
            This Policy applies to all interactions with us, including when you:
          </p>
          <ul className="list-disc ml-5">
            <li>
              Visit our website or any related site linking to this Policy.
            </li>
            <li>Use any Stacktrails products, platforms, or applications.</li>
            <li>
              Engage with us through marketing, events, or other communication
              channels.
            </li>
          </ul>
          <p className="mt-2">
            If you have any questions, please contact us at{" "}
            <strong>contact@stacktrails.com</strong>.
          </p>
        </PolicySection>

        <PolicySection id="section-2" title="2. Summary of Key Points">
          <ul className="list-disc ml-5 space-y-1">
            <li>
              We collect personal information you provide directly to us and
              some information automatically (e.g., IP address, browser data).
            </li>
            <li>
              We do not collect or process sensitive personal information.
            </li>
            <li>We do not obtain personal data from third parties.</li>
            <li>
              Your data is used to provide and improve services, ensure
              security, communicate with you, and comply with legal obligations.
            </li>
            <li>
              Information may be shared with service providers or in specific
              lawful situations.
            </li>
            <li>
              We implement technical and organizational security measures but
              cannot guarantee absolute security.
            </li>
            <li>
              You may have rights to access, correct, delete, or restrict the
              use of your personal information.
            </li>
            <li>
              We use cookies and similar technologies for functionality,
              analytics, and advertising.
            </li>
            <li>
              Our platform may use AI-powered tools from trusted providers.
            </li>
            <li>
              We may update this Policy periodically to stay legally compliant.
            </li>
          </ul>
        </PolicySection>

        <PolicySection id="section-3" title="3. Information We Collect">
          <h3 className="font-semibold mb-2">
            A. Personal Information You Provide
          </h3>
          <p>We collect personal information when you:</p>
          <ul className="list-disc ml-5 mb-4">
            <li>Register an account or log in to our Services.</li>
            <li>Express interest in our products or features.</li>
            <li>Engage in community activities or contact us.</li>
          </ul>
          <p>Examples of information collected include:</p>
          <ul className="list-disc ml-5 mb-4">
            <li>Email address</li>
            <li>Username</li>
            <li>Authentication or contact data</li>
          </ul>
          <p>
            If you register using a social media account, we may receive basic
            profile information from that platform.
          </p>

          <h3 className="font-semibold mt-4 mb-2">
            B. Information Collected Automatically
          </h3>
          <ul className="list-disc ml-5 mb-2">
            <li>IP address and device identifiers</li>
            <li>Browser and operating system details</li>
            <li>
              Usage logs, including pages visited and interaction timestamps
            </li>
          </ul>
          <p>
            We use cookies and similar technologies to support site
            functionality and security.
          </p>

          <h3 className="font-semibold mt-4 mb-2">C. Google API</h3>
          <p>
            Our use of Google API data complies with Google API Services User
            Data Policy, including Limited Use requirements.
          </p>
        </PolicySection>

        <PolicySection id="section-4" title="4. How We Use Your Information">
          <ul className="list-disc ml-5 space-y-1">
            <li>Create and manage user accounts</li>
            <li>Provide and maintain the functionality of our Services</li>
            <li>Respond to support requests and collect feedback</li>
            <li>
              Send service, marketing, and promotional communications (when
              permitted)
            </li>
            <li>Deliver personalized experiences and content</li>
            <li>
              Comply with applicable laws, prevent fraud, and ensure security
            </li>
          </ul>
        </PolicySection>

        <PolicySection id="section-5" title="5. Legal Basis for Processing">
          <ul className="list-disc ml-5 space-y-1">
            <li>
              <strong>Consent</strong>: You can withdraw consent at any time.
            </li>
            <li>
              <strong>Legitimate Interests</strong>: For product improvement,
              marketing, and service delivery.
            </li>
            <li>
              <strong>Legal Obligations</strong>: When required by law.
            </li>
            <li>
              <strong>Vital Interests</strong>: To protect individuals in urgent
              situations.
            </li>
          </ul>
        </PolicySection>

        <PolicySection id="section-6" title="6. Data Sharing">
          <p>We may share your information:</p>
          <ul className="list-disc ml-5 space-y-1">
            <li>
              With trusted service providers who help us operate our platform.
            </li>
            <li>
              In connection with a business transfer, merger, or acquisition.
            </li>
            <li>When required by law or to protect legal rights.</li>
          </ul>
          <p>We do not sell your personal data.</p>
        </PolicySection>

        <PolicySection id="section-7" title="7. Third-Party Links">
          <p>
            Our platform may contain links to third-party websites and services.
            We are not responsible for their content, security, or privacy
            practices. Please review the privacy policies of these third parties
            before sharing any information.
          </p>
        </PolicySection>

        <PolicySection
          id="section-8"
          title="8. Cookies & Tracking Technologies"
        >
          <p>We use cookies and similar tools to:</p>
          <ul className="list-disc ml-5 mb-4">
            <li>Maintain site functionality and security</li>
            <li>Personalize content and improve user experience</li>
            <li>Provide analytics and targeted advertising</li>
          </ul>
          <p>
            You can control cookies through your browser settings. We may also
            use Google Analytics.
          </p>
        </PolicySection>

        <PolicySection id="section-9" title="9. AI-Powered Features">
          <p>
            Stacktrails integrates AI features through trusted providers to
            enhance learning experiences. All AI-related data processing follows
            strict privacy and security standards.
          </p>
        </PolicySection>

        <PolicySection id="section-10" title="10. Social Logins">
          <p>
            If you sign in through a social media platform, we may receive
            limited profile information. We only use this information to
            facilitate your login experience and account management.
          </p>
        </PolicySection>

        <PolicySection id="section-11" title="11. Data Retention">
          <p>We retain personal information for as long as necessary to:</p>
          <ul className="list-disc ml-5 space-y-1">
            <li>Provide and maintain your account</li>
            <li>Comply with legal obligations</li>
            <li>Resolve disputes and enforce agreements</li>
          </ul>
          <p>
            When no longer needed, data will be securely deleted or anonymized.
          </p>
        </PolicySection>

        <PolicySection id="section-12" title="12. Data Security">
          <p>
            We use technical and organizational safeguards to protect personal
            information. However, no system is 100% secure. By using our
            Services, you acknowledge and accept this risk.
          </p>
        </PolicySection>

        <PolicySection id="section-13" title="13. Your Privacy Rights">
          <ul className="list-disc ml-5 space-y-1">
            <li>Access and obtain a copy of your data</li>
            <li>Correct inaccurate information</li>
            <li>Request deletion or restriction of your data</li>
            <li>Withdraw consent at any time</li>
            <li>Opt out of marketing communications</li>
          </ul>
          <p className="mt-2">
            You can exercise these rights by visiting your dashboard or emailing
            us at{" "}
            <a href="mailto:contact@stacktrails.com" className="text-blue-600">
              contact@stacktrails.com
            </a>
            .
          </p>
        </PolicySection>

        <PolicySection
          id="section-14"
          title="14. Do-Not-Track & Opt-Out Controls"
        >
          <p>
            Currently, we do not respond to DNT browser signals due to the
            absence of a universal standard. You may, however, manage tracking
            preferences through your browser or device settings.
          </p>
        </PolicySection>

        <PolicySection
          id="section-15"
          title="15. U.S. Residents’ Privacy Rights"
        >
          <p>
            Residents of California and other applicable U.S. states may have
            additional rights under state privacy laws, including:
          </p>
          <ul className="list-disc ml-5 space-y-1">
            <li>Right to access, correct, or delete personal data</li>
            <li>Right to opt out of targeted advertising or profiling</li>
            <li>Right to non-discrimination for exercising privacy rights</li>
          </ul>
        </PolicySection>

        <PolicySection id="section-16" title="16. Policy Updates">
          <p>
            We may update this Privacy Policy periodically. The latest version
            will always be available at stacktrails.com. Major changes will be
            communicated via email or a notice on our website.
          </p>
        </PolicySection>

        <PolicySection id="section-17" title="17. Contact Information">
          <p>
            <strong>Stacktrails</strong>
            <br />
            20 Ezeora Street, Satellite Town
            <br />
            Lagos, Lagos 102262, Nigeria
            <br />
            📧{" "}
            <a href="mailto:support@stacktrails.com" className="text-blue-600">
              support@stacktrails.com
            </a>
          </p>
        </PolicySection>

        <PolicySection
          id="section-18"
          title="18. Reviewing or Deleting Your Data"
        >
          <p>
            You may request to review, update, or delete your personal
            information by:
          </p>
          <ul className="list-disc ml-5 space-y-1">
            <li>Visiting your dashboard</li>
            <li>
              Contacting us at{" "}
              <a
                href="mailto:contact@stacktrails.com"
                className="text-blue-600"
              >
                contact@stacktrails.com
              </a>
            </li>
          </ul>
          <p>
            We will respond in accordance with applicable data protection laws.
          </p>
        </PolicySection>
      </div>
    </CenterOnLgScreen>
  );
}

function PolicySection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <details id={id} className="border-t border-gray-200 py-4" open>
      <summary className="font-semibold cursor-pointer text-gray-800">
        {title}
      </summary>
      <div className="mt-2 text-gray-700 space-y-2">{children}</div>
    </details>
  );
}
