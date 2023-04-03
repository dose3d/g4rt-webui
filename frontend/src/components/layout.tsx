import React from 'react';

interface ChildrenProps {
  children: React.ReactNode;
}

export function Page({ children }: ChildrenProps) {
  return <main>{children}</main>;
}

export function PageHeader({ children }: ChildrenProps) {
  return (
    <header className="block items-center justify-between border-b border-gray-200 bg-white p-4 sm:flex lg:mt-1.5">
      <div className="mb-1 w-full">{children}</div>
    </header>
  );
}

export function Title({ children }: ChildrenProps) {
  return <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">{children}</h1>;
}

export function Description({ children }: ChildrenProps) {
  return <p className="text-base font-normal text-gray-500">{children}</p>;
}
