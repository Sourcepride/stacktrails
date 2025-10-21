import { appFetch } from "@/lib/appFetch";
import { BackendRoutes } from "@/routes";
import { ContactFormData, ContactFormResponse } from "@/types/contact";

export async function submitContactForm(
  data: ContactFormData
): Promise<ContactFormResponse> {
  const response = await appFetch<ContactFormResponse>(
    BackendRoutes.CONTACT_FORM,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error(response.data?.message || "Failed to submit contact form");
  }

  return response.data;
}
