"use client";
import CenterOnLgScreen from "@/common/utils/CenterOnLgScreen";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { PublicRoutes } from "@/routes";
import { MessageCircle } from "lucide-react";
import { useState } from "react";

const faqs = [
  {
    q: "What is Stacktrails?",
    a: "Stacktrails is a community-driven learning platform that allows individuals and groups to create, organize, and share learning resources such as documents, videos, and links — all in one place. Our goal is to make learning organized, collaborative, and motivating.",
  },
  {
    q: "Is Stacktrails free to use?",
    a: "Yes, Stacktrails is free to use for most features. We plan to introduce optional premium tools (like AI-powered study paths or private learning groups) in the future, but the core experience will remain free and community-driven.",
  },
  {
    q: "Does Stacktrails host files directly?",
    a: "No. Stacktrails does not host uploaded files such as PDFs or videos. Instead, users share links to external sources (like YouTube, Google Drive, or Dropbox). This keeps the platform lightweight and focused on organization, not file storage.",
  },
  {
    q: "Are external links on Stacktrails safe?",
    a: "While we encourage responsible sharing, Stacktrails cannot guarantee the safety of every external link. We rely on our community to report malicious or inappropriate content, and we promptly remove anything that violates our Terms and Conditions.",
  },
  {
    q: "Who can use Stacktrails?",
    a: "Anyone! Whether you're a student, professional, or lifelong learner, Stacktrails helps you find or organize learning materials around any topic or goal.",
  },
  // {
  //   q: "What makes Stacktrails different from Reddit or Notion?",
  //   a: "Reddit is great for discussion, and Notion is great for note-taking — but Stacktrails combines the best of both: structured learning paths, community discussions and reviews, smart recommendations powered by AI (coming soon), and a focus on shared growth and collaboration.",
  // },
  {
    q: "How can I create or join a learning community?",
    a: "You can create a group around a course, invite others, or discover existing communities with similar goals. You can then contribute resources, comment, and collaborate together.",
  },
  {
    q: "What if I find incorrect or inappropriate content?",
    a: "We encourage users to report such content immediately using the in-platform report tool or by contacting our support team. We review all reports and take appropriate action to maintain a respectful environment.",
  },
  {
    q: "Can I use Stacktrails to study privately?",
    a: "Yes! You can create private learning collections (available soon) to keep personal resources organized without sharing them publicly.",
  },
  {
    q: "Does Stacktrails collect personal data?",
    a: "We collect only the information necessary to provide and improve our services — such as your email, profile info, and usage data. We never sell your data. See our Privacy Policy for details.",
  },
  {
    q: "How does Stacktrails use AI?",
    a: "Stacktrails will use AI to recommend learning materials based on your interests and goals, help summarize or organize study content, and facilitate smarter collaboration between learners. AI features are designed to assist, not replace, human collaboration.",
  },
  {
    q: "How does Stacktrails keep the community respectful?",
    a: "We expect all users to follow our Community Guidelines — be respectful, share responsibly, and uphold integrity. Toxic or harmful behavior can lead to account suspension or removal.",
  },
  {
    q: "Can I monetize my learning resources?",
    a: "Currently, Stacktrails is a free, open platform, but in the future, we may introduce creator tools that let users offer structured courses or premium content under clear community rules.",
  },
  {
    q: "How can I contact Stacktrails?",
    a: "You can reach our support team at support@stacktrails.com or visit our Contact page.",
  },
  {
    q: "What's next for Stacktrails?",
    a: "We're continuously improving! Upcoming features include AI-powered learning recommendations, group study sessions, progress tracking, and verified learning channels.",
  },
];

export default function Page() {
  const [selectedFaq, setSelectedFaq] = useState<string>("");

  const scrollToFaq = (index: number) => {
    setSelectedFaq(`item-${index}`);
    const element = document.getElementById(`faq-${index}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <CenterOnLgScreen element="main" className="py-10">
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 lg:py-12">
          {/* Header Section */}
          <div className="mb-8 lg:mb-12">
            <h1 className="text-4xl lg:text-center lg:text-5xl font-bold mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-lg mx-auto text-muted-foreground max-w-[80ch] text-center">
              Quick answers to questions you may have about Stacktrails . Can't
              find what you're looking for? Reach out to us form more
              information by clicking the button .
            </p>
            <div className="flex justify-center flex-wrap gap-3 mt-6 ">
              <Link href={PublicRoutes.CONTACT}>
                <Button size={"lg"} className="text-white">
                  Reach out
                </Button>
              </Link>
            </div>
          </div>

          {/* Navigation and FAQ Content */}
          <div className="grid lg:grid-cols-[300px_1fr] gap-8 lg:gap-12">
            {/* Sidebar Navigation */}
            <aside className="lg:sticky lg:top-8 lg:h-fit">
              <div className="bg-card lg:border lg:border-gray-300 rounded-lg p-6">
                <div className="flex-col gap-2 mb-6 hidden lg:flex">
                  {/* <Button
                    variant="outline"
                    className="w-full justify-start"
                    size="sm"
                  >
                    <BookOpen className="mr-2 h-4 w-4" />
                    Documentation
                  </Button> */}
                  <Link href={PublicRoutes.CONTACT}>
                    <Button
                      variant={"outline"}
                      className="w-full justify-start"
                      size="sm"
                    >
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Get in touch
                    </Button>
                  </Link>
                </div>
                <nav className="space-y-1 hidden lg:block">
                  {faqs.map((faq, index) => (
                    <button
                      key={index}
                      onClick={() => scrollToFaq(index)}
                      className="block w-full text-left text-sm py-2 px-3 rounded hover:bg-base transition-colors"
                    >
                      {faq.q}
                    </button>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Main FAQ Content */}
            <div>
              <Accordion
                type="single"
                collapsible
                className="space-y-4"
                value={selectedFaq}
                onValueChange={setSelectedFaq}
              >
                {faqs.map((faq, index) => (
                  <AccordionItem
                    key={index}
                    value={`item-${index}`}
                    className="border border-gray-300 rounded-lg px-6 bg-card"
                    id={`faq-${index}`}
                  >
                    <AccordionTrigger className="text-left hover:no-underline py-5">
                      <span className="font-semibold">{faq.q}</span>
                    </AccordionTrigger>
                    <AccordionContent className="text-[#6c757d] pb-5">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </div>
      </div>
    </CenterOnLgScreen>
  );
}
