import React from 'react';
import { Link } from 'react-router-dom';
import { Description, Page, PageHeader, Title } from '../../components/layout';
import {
  AddIcon,
  DeleteIcon,
  EditIcon,
  GreaterButtonIcon,
  GreaterIcon,
  LowerButtonIcon,
  LowerIcon,
} from '../../components/icons';
import { JobEntity } from '../../api/jobs';

function TableHeader() {
  return (
    <thead className="bg-gray-100">
      <tr>
        <th scope="col" className="p-4 text-left text-xs font-medium uppercase text-gray-500">
          ID
        </th>
        <th scope="col" className="w-full p-4 text-left text-xs font-medium uppercase text-gray-500">
          Job title
        </th>
        <th scope="col" className="p-4 text-left text-xs font-medium uppercase text-gray-500">
          Status
        </th>
        <th scope="col" className="p-4 text-left text-xs font-medium uppercase text-gray-500">
          Create
        </th>
        <th scope="col" className="p-4 text-left text-xs font-medium uppercase text-gray-500">
          Update
        </th>
        <th scope="col" className="p-4 text-center text-xs font-medium uppercase text-gray-500">
          Details
        </th>
      </tr>
    </thead>
  );
}

interface JobTableRow {
  job: JobEntity;
}

function TableRow({ job: { id, title, description, status, is_error, updated_at, created_at } }: JobTableRow) {
  return (
    <tr className="hover:bg-gray-100">
      <td className="whitespace-nowrap p-4 text-base font-medium text-gray-900">#{id}</td>
      <td className="whitespace-nowrap p-4 text-sm font-normal text-gray-500">
        <div className="text-base font-semibold text-gray-900">{title}</div>
        <div className="text-sm font-normal text-gray-500">{description}</div>
      </td>
      <td className="whitespace-nowrap p-4 text-base font-medium text-gray-900">{status}</td>
      <td className="whitespace-nowrap p-4 text-base font-medium text-gray-900">{created_at}</td>
      <td className="whitespace-nowrap p-4 text-base font-medium text-gray-900">{updated_at}</td>
      <td className="space-x-2 whitespace-nowrap p-4">
        <button
          type="button"
          data-modal-toggle="product-modal"
          className="inline-flex items-center rounded-lg bg-cyan-600 px-3 py-2 text-center text-sm font-medium text-white hover:bg-cyan-700 focus:ring-4 focus:ring-cyan-200"
        >
          <EditIcon />
          Details
        </button>
      </td>
    </tr>
  );
}

interface PaginationProps {
  firstNo: number;
  latestNo: number;
  count: number;
  loadPref: () => void;
  loadNext: () => void;
}

function Pagination({ firstNo, latestNo, count, loadPref, loadNext }: PaginationProps) {
  return (
    <div className="sticky bottom-0 right-0 w-full items-center border-t border-gray-200 bg-white p-4 sm:flex sm:justify-between">
      <div className="mb-4 flex items-center sm:mb-0">
        <button
          onClick={loadPref}
          className="inline-flex cursor-pointer justify-center rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
        >
          <LowerIcon />
        </button>
        <button
          onClick={loadNext}
          className="mr-2 inline-flex cursor-pointer justify-center rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
        >
          <GreaterIcon />
        </button>
        <span className="text-sm font-normal text-gray-500">
          Showing <span className="font-semibold text-gray-900">{firstNo}-{latestNo}</span> of{' '}
          <span className="font-semibold text-gray-900">{count}</span>
        </span>
      </div>
      <div className="flex items-center space-x-3">
        <button
          onClick={loadPref}
          className="inline-flex flex-1 items-center justify-center rounded-lg bg-cyan-600 px-3 py-2 text-center text-sm font-medium text-white hover:bg-cyan-700 focus:ring-4 focus:ring-cyan-200"
        >
          <LowerButtonIcon />
          Previous
        </button>
        <button
          onClick={loadNext}
          className="inline-flex flex-1 items-center justify-center rounded-lg bg-cyan-600 px-3 py-2 text-center text-sm font-medium text-white hover:bg-cyan-700 focus:ring-4 focus:ring-cyan-200"
        >
          Next
          <GreaterButtonIcon />
        </button>
      </div>
    </div>
  );
}

export default function JobsPage() {
  return (
    <Page>
      <PageHeader>
        <Title>List of jobs</Title>
        <div className="block items-center sm:flex md:divide-x md:divide-gray-100">
          <form className="mb-4 sm:mb-0 sm:pr-3" action="#" method="GET">
            <label htmlFor="products-search" className="sr-only">
              Search
            </label>
            <div className="relative mt-1 sm:w-64 xl:w-96">
              <input
                type="text"
                name="email"
                id="products-search"
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-cyan-600 focus:ring-cyan-600 sm:text-sm"
                placeholder="Search for jobs"
                disabled
              />
            </div>
          </form>
          <div className="flex w-full items-center sm:justify-end">
            <Link
              to="/jobs/create"
              className="inline-flex items-center rounded-lg bg-cyan-600 px-3 py-2 text-center text-sm font-medium text-white hover:bg-cyan-700 focus:ring-4 focus:ring-cyan-200 sm:ml-auto"
            >
              <AddIcon />
              New job
            </Link>
          </div>
        </div>
      </PageHeader>
      <div className="flex flex-col">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden shadow">
              <table className="min-w-full table-fixed divide-y divide-gray-200">
                <TableHeader />
                <tbody className="divide-y divide-gray-200 bg-white">
                  <TableRow
                    job={{
                      id: 1,
                      title: 'Job 1',
                      description: 'First job',
                      status: 'Test',
                      is_error: false,
                      created_at: '',
                      updated_at: '',
                    }}
                  />
                  <TableRow
                    job={{
                      id: 2,
                      title: 'Job 2',
                      description: 'Second job',
                      status: 'Test',
                      is_error: false,
                      created_at: '',
                      updated_at: '',
                    }}
                  />
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <Pagination firstNo={1} latestNo={20} count={14} loadNext={() => {}} loadPref={() => {}} />
    </Page>
  );
}
