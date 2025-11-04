import CenterOnLgScreen from "@/common/utils/CenterOnLgScreen";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { PublicRoutes } from "@/routes";

import type { Metadata } from "next";
import FaqContent from "./Faq";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description:
    "Find answers to common questions about StackTrails — from how it works to getting started with learning paths.",
  alternates: {
    canonical: "https://stacktrails.com/site/faqs",
  },
  openGraph: {
    title: "StackTrails FAQs",
    description:
      "Your most common questions about StackTrails answered in one place.",
    url: "https://stacktrails.com/site/faqs",
  },
};

export default function Page() {
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

            {/* Main FAQ Content */}
            <FaqContent />
          </div>
        </div>
      </div>
    </CenterOnLgScreen>
  );
}
