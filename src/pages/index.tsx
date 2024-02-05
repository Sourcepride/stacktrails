import HomeLayout from '@/components/layouts/home-layout';
import Button from '@/components/ui/atoms/button';

export default function Home() {
  return (
    <HomeLayout>
      <main>
        {/* Hero section */}
        <section className="w-full max-w-6xl mx-auto text-center p-5 lg:p-20">
          {/* Hero content */}
          <div className="w-full max-w-2xl mx-auto flex flex-col gap-5 items-center">
            <h1 className="font-bold text-5xl leading-snug">
              Learning tech doesn't have to be tedious
            </h1>
            <p className="text-lg">
              Ease up your learning with the help of a community.
            </p>
            <Button>Get Started</Button>
          </div>
        </section>
      </main>
    </HomeLayout>
  );
}
