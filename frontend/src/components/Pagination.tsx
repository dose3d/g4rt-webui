import { DoubleLeftIcon, DoubleRightIcon, LeftIcon, RightIcon } from './icons';
import React, { useEffect, useRef, useState } from 'react';
import { PaginationController } from '../drf-crud-client';

interface PaginationProps {
  controller: PaginationController;
  pageSize: number;
  setPageSize: (v: number) => void;
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
      <button type="button" onClick={close} className="btn-ghost btn-xs btn">
        X
      </button>
    </form>
  );
}

function Pagination({
  controller: { page, pagesCount, goNext, goPrev, goFirst, goLatest, goPage },
  pageSize,
  setPageSize,
}: PaginationProps) {
  const [manualPage, setManualPage] = useState(false);

  return (
    <div className="sticky grid grid-cols-3 border-t border-gray-200 bg-white p-4">
      <div />
      <div className=" flex items-center justify-center">
        <button onClick={goFirst} className="btn-ghost btn">
          <DoubleLeftIcon />
        </button>
        <button onClick={goPrev} className="btn-ghost btn">
          <LeftIcon />
        </button>
        {manualPage ? (
          <ManualPage count={pagesCount || 1} close={() => setManualPage(false)} current={page} setPage={goPage} />
        ) : (
          <span className="mx-2 text-sm font-normal text-gray-500" onClick={() => setManualPage(true)}>
            <span className="font-bold text-gray-900">{page}</span>
            <span className="mx-2">of</span>
            <span className="font-bold text-gray-900">{pagesCount}</span>
          </span>
        )}
        <button onClick={goNext} className="btn-ghost btn">
          <RightIcon />
        </button>
        <button onClick={goLatest} className="btn-ghost btn">
          <DoubleRightIcon />
        </button>
      </div>
      <div className="justify-self-end">
        <div className=" flex justify-items-center">
          <div className="m-auto mr-2 text-sm">Show per page:</div>
          <div>
            <select
              className="select-bordered select w-full max-w-xs"
              onChange={(e) => {
                setPageSize(parseInt(e.target.value));
                goPage(1);
              }}
              value={pageSize}
            >
              <option>10</option>
              <option>25</option>
              <option>100</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Pagination;
