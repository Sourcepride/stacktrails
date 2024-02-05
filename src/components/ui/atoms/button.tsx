import { ReactNode } from 'react';

export default function Button({ children }: { children: ReactNode }) {
  return (
    <button className="px-5 py-3 border border-black hover:bg-black hover:text-white rounded-2xl w-max shadow-md">
      {children}
    </button>
  );
}
