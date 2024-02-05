import { ReactNode } from 'react';
import Footer from '../ui/organisms/footer';
import Header from '../ui/organisms/header';

export default function HomeLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}
