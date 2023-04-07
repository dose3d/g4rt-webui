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

export function Content({ children }: ChildrenProps) {
  return (
    <div className="flex flex-col">
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden shadow">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function Margin({ children }: ChildrenProps) {
  return <div className="px-4 pt-6">{children}</div>;
}

export function CardsContainer({ children }: ChildrenProps) {
  return <div className="grid grid-cols-1">{children}</div>;
}

export function Card({ children }: ChildrenProps) {
  return <div className="rounded-lg bg-white p-4 shadow sm:p-6 xl:p-8">{children}</div>;
}

export function CardHeader({ children }: ChildrenProps) {
  return <div className="mb-4 flex items-center justify-between">{children}</div>;
}

export function CardHeaderMain({ children }: ChildrenProps) {
  return <div>{children}</div>;
}

export function CardHeaderTitle({ children }: ChildrenProps) {
  return <h2 className="mb-2 text-xl font-bold text-gray-900">{children}</h2>;
}

export function CardHeaderSubTitle({ children }: ChildrenProps) {
  return <span className="text-base font-normal text-gray-500">{children}</span>;
}
