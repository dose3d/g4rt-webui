import { DoubleLeftIcon, DoubleRightIcon, LeftIcon, RightIcon } from './icons';
import React from 'react';

interface PaginationProps {
  current: number;
  count?: number;
  loadFirst: () => void;
  loadPrev: () => void;
  loadNext: () => void;
  loadLatest: () => void;
}

function Pagination({ current, count, loadFirst, loadPrev, loadNext, loadLatest }: PaginationProps) {
  return (
    <div className="sticky flex items-center justify-center border-t border-gray-200 bg-white p-4">
      <button onClick={loadFirst} className="btn-ghost btn">
        <DoubleLeftIcon />
      </button>
      <button onClick={loadPrev} className="btn-ghost btn">
        <LeftIcon />
      </button>
      <span className="mx-2 text-sm font-normal text-gray-500">
        <span className="font-bold text-gray-900">{current}</span>
        <span className="mx-2">of</span>
        <span className="font-bold text-gray-900">{count}</span>
      </span>
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
