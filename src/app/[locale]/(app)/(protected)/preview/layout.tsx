import PublicFooter from "@/components/layout/Footer";
import PublicHeader from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  return (
    <>
      <PublicHeader />
      <Sidebar />

      {children}

      <PublicFooter />
    </>
  );
}
