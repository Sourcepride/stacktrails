import { Icon } from '@iconify/react';
import Button from '../atoms/button';

export default function Header() {
  return (
    <header className="p-5">
      <div className="flex justify-between items-center py-5 max-w-6xl mx-auto">
        {/* Brand */}
        <div className="flex gap-3 items-center">
          <Icon icon="ph:stack-thin" width="36" />
          <div>Stacktrails</div>
        </div>

        {/* Navigation */}
        <nav className="flex gap-10">
          <div>Learn</div>
          <div>Community</div>
          <div>Features</div>
          <div>Roadmaps</div>
        </nav>

        {/* CTA */}
        <div>
          <Button>Join the waitlist</Button>
        </div>
      </div>
    </header>
  );
}
