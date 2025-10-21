"use client";

import CenterOnLgScreen from "@/common/utils/CenterOnLgScreen";

export default function Page() {
  return (
    <CenterOnLgScreen element={"main"} className="space-y-16">
      <section className={`space-y-8`}>
        <h1
          className={`font-bold text-center text-2xl text-accent  md:text-3xl xl:text-4xl`}
        >
          About US
        </h1>
        <p className="text-center">
          StackTrails is an open platform where communities create, organize,
          and aggregate share learning resources. It's where collaborative
          spirit meets structured learning, built by learners, for learners. At
          Stacktrails, we believe that learning is a collaborative journey, not
          a solitary one. In a world overflowing with information, finding a
          clear and organized path can be the biggest hurdle to success.
        </p>

        <div className="mt-4">
          <img
            src={"/pexels-vlada-karpovich-4050320.jpg"}
            alt="study"
            className="w-full  h-[400px]  object-cover"
          />
        </div>
      </section>
      <section className={`space-y-8`}>
        <h2 className={`font-bold text-center text-2xl md:text-3xl  `}>
          Our Story
        </h2>
        <div className="w-full flex gap-4 lg:items-center">
          <div className="grow hidden lg:!block ">
            <img
              src={"/pexels-ivan-samkov-5676666.jpg"}
              alt="study group"
              className="w-full max-h-[500px] object-cover"
            />
          </div>
          <p className="lg:basis-[60%]">
            In 2024, I was preparing for an entrance exam that would change my
            life. I knew what I needed to study, but finding organized materials
            felt like searching for puzzle pieces scattered across the internet.
            Hours that should have been spent learning were instead spent
            hunting through YouTube, bookmarking articles, and trying to make
            sense of disconnected resources. A breakthrough occurred when I
            stumbled upon a subreddit where people shared their experiences with
            the same exam. They offered advice, shared resources, and supported
            each other. It was a lightbulb moment: Why isn't there a platform
            that combines the collaborative spirit of a community like Reddit
            with the structured organization of a proper study plan? The idea
            became personal when I had to retake the exam the following year. I
            found myself repeating the same frustrating process: digging through
            old bookmarks, scrolling through my YouTube history, and
            rediscovering resources I'd already found. That frustration became
            my clarity: learners need a platform that remembers for them, grows
            with them, and connects them with others on the same path.
          </p>
        </div>
      </section>
      <section className={`space-y-8`}>
        <h2 className={`text-2xl text-center font-bold md:text-3xl`}>
          Our Vision
        </h2>
        <p>
          We envision a world where no one has to learn alone. We aim to create
          channels where like-minded individuals can connect, share their goals,
          learn from one another, and grow together. We believe in making
          learning easier, smarter, and more organized, while using the power of
          community to supercharge motivation and achieve better outcomes.
        </p>
      </section>
      <section className={`space-y-8`}>
        <h2 className={`text-2xl text-center font-bold md:text-3xl`}>
          Our Mission
        </h2>
        <p>
          To provide an open platform where anyone, anywhere in the world, can
          create and organize learning resources. These "trails" are vetted by a
          community of learners through comments and reviews, providing clear
          guidance for everyone, especially newcomers. We are building an
          ecosystem that fosters peer-to-peer learning and integrates AI-powered
          tools to create a truly smart and supportive learning experience.
        </p>
      </section>
      <section className={`space-y-8`}>
        <h2 className={`text-2xl text-center font-bold md:text-3xl`}>
          Join the Journey
        </h2>
        <div>
          StackTrails is just getting started, and you're early. Every learning
          path you create, every resource you share, and every comment you leave
          makes the platform better for everyone who comes after you. We're not
          just building a platform, we're building a movement that makes
          learning accessible, collaborative, and genuinely effective. Welcome
          to StackTrails. Let's learn, grow, and succeed together.
        </div>
      </section>
    </CenterOnLgScreen>
  );
}
