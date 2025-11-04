"use client";

import CenterOnLgScreen from "@/common/utils/CenterOnLgScreen";
import { Link } from "@/i18n/navigation";
import { appToast } from "@/lib/appToast";
import { submitContactForm } from "@/lib/http/contactFunc";
import { PublicRoutes } from "@/routes";
import { ContactFormData } from "@/types/contact";
import { Button, TextField } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useState } from "react";

// export const metadata: Metadata = {
//   title: "Contact Us",
//   description:
//     "Get in touch with the StackTrails team. We're here to answer your questions, support your learning, and explore partnerships.",
//   alternates: {
//     canonical: "https://stacktrails.com/contact",
//   },
//   openGraph: {
//     title: "Contact StackTrails",
//     description:
//       "Reach out to StackTrails for support, inquiries, or collaboration opportunities.",
//     url: "https://stacktrails.com/contact",
//   },
// };

export default function Page() {
  const t = useTranslations();
  const [formData, setFormData] = useState<ContactFormData>({
    title: "",
    message: "",
  });
  const [errors, setErrors] = useState<Partial<ContactFormData>>({});

  const contactMutation = useMutation({
    mutationFn: submitContactForm,
    onSuccess: (data) => {
      appToast.Success(data.message || "Message sent successfully!");
      // Clear form
      setFormData({ title: "", message: "" });
      setErrors({});
    },
    onError: (error: Error) => {
      appToast.Error(
        error.message || "Failed to send message. Please try again."
      );
    },
  });

  const validateForm = (): boolean => {
    const newErrors: Partial<ContactFormData> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters long";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange =
    (field: keyof ContactFormData) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));

      // Clear error when user starts typing
      if (errors[field]) {
        setErrors((prev) => ({
          ...prev,
          [field]: undefined,
        }));
      }
    };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    contactMutation.mutate(formData);
  };

  return (
    <CenterOnLgScreen element={"main"} className="space-y-1">
      <h1 className="text-center text-accent font-bold text-2xl md:text-3xl">
        {t("CONTACT_US.HEADING")}
      </h1>
      <p className=" text-center">{t("CONTACT_US.SUB_HEADING")}</p>
      <p className="text-center text-[#6c757d]">
        If you have a question, please make sure you have visited the{" "}
        <Link href={PublicRoutes.FAQs} className="text-primary">
          FAQ page
        </Link>
        where we addressed some questions you may have{" "}
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-8">
        <TextField
          label={t("CONTACT_US.TITLE")}
          placeholder={t("CONTACT_US.TITLE")}
          value={formData.title}
          onChange={handleInputChange("title")}
          error={!!errors.title}
          helperText={errors.title}
          required
        />
        <TextField
          multiline
          rows={6}
          placeholder={t("CONTACT_US.MESSAGE")}
          value={formData.message}
          onChange={handleInputChange("message")}
          error={!!errors.message}
          helperText={errors.message}
          required
        />
        <Button
          type="submit"
          className="!capitalize"
          disabled={contactMutation.isPending}
        >
          {contactMutation.isPending ? "Sending..." : t("CONTACT_US.SUBMIT")}
        </Button>
      </form>
    </CenterOnLgScreen>
  );
}
