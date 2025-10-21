export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  return <>{children}</>;
}
