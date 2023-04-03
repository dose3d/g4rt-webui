import { GreaterButtonIcon, GreaterIcon, LowerButtonIcon, LowerIcon } from './icons';
import React from 'react';

interface PaginationProps {
  firstNo: number;
  latestNo: number;
  count?: number;
  loadPref: () => void;
  loadNext: () => void;
}

function Pagination({ firstNo, latestNo, count, loadPref, loadNext }: PaginationProps) {
  return (
    <div className="sticky bottom-0 right-0 w-full items-center border-t border-gray-200 bg-white p-4 sm:flex sm:justify-between">
      <div className="mb-4 flex items-center sm:mb-0">
        <button onClick={loadPref} className="btn-ghost btn">
          <LowerIcon />
        </button>
        <button onClick={loadNext} className="btn-ghost btn mr-4">
          <GreaterIcon />
        </button>
        <span className="text-sm font-normal text-gray-500">
          Showing{' '}
          <span className="font-semibold text-gray-900">
            {firstNo}-{latestNo}
          </span>{' '}
          of <span className="font-semibold text-gray-900">{count}</span>
        </span>
      </div>
      <div className="flex items-center space-x-3">
        <button onClick={loadPref} className="btn-ghost btn">
          <LowerButtonIcon />
          Previous
        </button>
        <button onClick={loadNext} className="btn-ghost btn">
          Next
          <GreaterButtonIcon />
        </button>
      </div>
    </div>
  );
}

export default Pagination;
