import { Icon } from '@iconify/react';

export default function Footer() {
  return (
    <footer className="p-5">
      {/* Footer container */}
      <section className="bg-black rounded-3xl text-slate-100 p-5 lg:p-20">
        {/* Footer content */}
        <div className="w-full max-w-6xl mx-auto grid grid-cols-5 gap-10">
          <div className="grid gap-5 lg:gap-10">
            {/* Brand */}
            <div className="flex gap-3 items-center">
              <Icon icon="ph:stack-thin" width="36" />
              <div>Stacktrails</div>
            </div>

            {/* Tagline */}
            <div className="text-slate-200">
              Simplifying your learning odyssey
            </div>

            {/* Socials */}
            <div className="flex gap-3 text-slate-200">
              <p className="font-bold">Connect with us:</p>
              <div>
                <Icon icon="pajamas:twitter" width="24" />
              </div>
              <div>
                <Icon icon="ri:instagram-line" width="24" />
              </div>
              <div>
                <Icon icon="ic:twotone-facebook" width="24" />
              </div>
              <div>
                <Icon icon="mdi:linkedin" width="24" />
              </div>
            </div>
          </div>

          {/* Empty div - Don't delete yet */}
          <div></div>

          {/* Features */}
          <div>
            <div className="font-semibold mb-5">Features</div>
            <div>Discover</div>
            <div>Connect</div>
            <div>Personalize</div>
            <div>Navigate</div>
          </div>

          {/* Company */}
          <div>
            <div className="font-semibold mb-5">Company</div>
            <div>Pricing</div>
            <div>Changelog</div>
            <div>Careers</div>
            <div>Support</div>
            <div>Community</div>
          </div>

          {/* Legal */}
          <div>
            <div className="font-semibold mb-5">Legal</div>
            <div>Privacy Policy</div>
            <div>Terms of Service</div>
            <div>Security</div>
          </div>
        </div>
      </section>
    </footer>
  );
}
