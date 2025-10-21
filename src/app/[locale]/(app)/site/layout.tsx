import CenterOnLgScreen from "@/common/utils/CenterOnLgScreen";
import PublicFooter from "@/components/layout/Footer";
import PublicHeader from "@/components/layout/Header";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  // const { locale } = await params;
  return (
    <>
      <PublicHeader />
      <CenterOnLgScreen props={{ component: "main" }}>
        {children}
      </CenterOnLgScreen>
      <PublicFooter />
    </>
  );
}
