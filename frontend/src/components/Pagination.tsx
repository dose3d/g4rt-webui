import { DoubleLeftIcon, DoubleRightIcon, LeftIcon, RightIcon } from './icons';
import React, { useEffect, useRef, useState } from 'react';

interface PaginationProps {
  current: number;
  count?: number;
  loadFirst: () => void;
  loadPrev: () => void;
  loadNext: () => void;
  loadLatest: () => void;
  setPage: (v: number) => void;
}

interface ManualPageProps {
  setPage: (v: number) => void;
  current: number;
  close: () => void;
  count: number;
}

function ManualPage({ setPage, current, close, count }: ManualPageProps) {
  const input = useRef<HTMLInputElement>(null);
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPage(parseInt(input.current?.value || '1'));
    close();
  };

  useEffect(() => {
    if (input.current) {
      input.current.value = `${current}`;
    }
  }, [current]);

  return (
    <form className="mx-2 text-sm font-normal text-gray-500" onSubmit={onSubmit}>
      <input ref={input} type="number" min={1} max={count} className="w-10" required />
      <button type="submit" className="btn-primary btn-xs btn">
        Go
      </button>
      <button type="button" onClick={close} className="btn-ghost btn-xs btn">X</button>
    </form>
  );
}

function Pagination({ current, count, loadFirst, loadPrev, loadNext, loadLatest, setPage }: PaginationProps) {
  const [manualPage, setManualPage] = useState(false);

  return (
    <div className="sticky flex items-center justify-center border-t border-gray-200 bg-white p-4">
      <button onClick={loadFirst} className="btn-ghost btn">
        <DoubleLeftIcon />
      </button>
      <button onClick={loadPrev} className="btn-ghost btn">
        <LeftIcon />
      </button>
      {manualPage ? (
        <ManualPage count={count || 1} close={() => setManualPage(false)} current={current} setPage={setPage} />
      ) : (
        <span className="mx-2 text-sm font-normal text-gray-500" onClick={() => setManualPage(true)}>
          <span className="font-bold text-gray-900">{current}</span>
          <span className="mx-2">of</span>
          <span className="font-bold text-gray-900">{count}</span>
        </span>
      )}
      <button onClick={loadNext} className="btn-ghost btn mr-4">
        <RightIcon />
      </button>
      <button onClick={loadLatest} className="btn-ghost btn mr-4">
        <DoubleRightIcon />
      </button>
    </div>
  );
}

export default Pagination;
