import React from 'react';
import { Link } from 'react-router-dom';
import { JOB_STATUS_NAME, JobEntityListItem } from '../api/jobs';
import { ArrowTopRightOnSquareIcon } from './icons';
import { Content } from './layout';
import { formatDate } from '../utils/formatValues';

function TableHeader() {
  return (
    <thead className="bg-gray-100">
      <tr>
        <th scope="col" className="w-16 p-4 text-center text-xs font-medium uppercase text-gray-500">
          ID
        </th>
        <th scope="col" className="w-64 p-4 text-center text-xs font-medium uppercase text-gray-500 md:w-full">
          Job title
        </th>
        <th scope="col" className="w-24 p-4 text-center text-xs font-medium uppercase text-gray-500">
          Status
        </th>
        <th scope="col" className="w-36 p-4 text-center text-xs font-medium uppercase text-gray-500">
          Create
        </th>
        <th scope="col" className="w-36 p-4 text-center text-xs font-medium uppercase text-gray-500">
          Update
        </th>
        <th scope="col" className="w-32 p-4 text-center text-xs font-medium uppercase text-gray-500">
          Details
        </th>
      </tr>
    </thead>
  );
}

interface JobTableRow {
  job: JobEntityListItem;
}

function TableRow({ job: { id, title, description, status, updated_at, created_at } }: JobTableRow) {
  return (
    <tr className="hover:bg-gray-100">
      <td className="whitespace-nowrap p-4 text-right text-base font-medium text-gray-900">#{id}</td>
      <td className="whitespace-nowrap p-4 text-sm font-normal text-gray-500">
        <Link to={`/jobs/${id}`}>
          <div className="overflow-hidden text-ellipsis text-base font-semibold text-gray-900">{title}</div>
          <div className="overflow-hidden text-ellipsis text-sm font-normal text-gray-500">{description}</div>
        </Link>
      </td>
      <td className="whitespace-nowrap p-4 text-center text-base font-medium text-gray-900">
        {JOB_STATUS_NAME[status]}
      </td>
      <td className="whitespace-nowrap p-4 text-center text-sm font-normal text-gray-900">{formatDate(created_at)}</td>
      <td className="whitespace-nowrap p-4 text-center text-sm font-normal text-gray-900">{formatDate(updated_at)}</td>
      <td className="space-x-2 whitespace-nowrap p-4 text-center">
        <Link to={`/jobs/${id}`} data-modal-toggle="product-modal" className="btn-ghost btn h-12">
          <ArrowTopRightOnSquareIcon />
        </Link>
      </td>
    </tr>
  );
}

function TableEmptyRows({ count }: { count: number }) {
  if (!count) {
    return null;
  }

  const rows = Array.from(Array(count).keys());

  return (
    <>
      {rows.map((o, i) => (
        <tr className="hover:bg-gray-100" key={i}>
          <td className="whitespace-nowrap p-4 text-right text-base font-medium text-gray-900"></td>
          <td className="whitespace-nowrap p-4 text-sm font-normal text-gray-500"></td>
          <td className="whitespace-nowrap p-4 text-center text-base font-medium text-gray-900"></td>
          <td className="whitespace-nowrap p-4 text-center text-sm font-normal text-gray-900"></td>
          <td className="whitespace-nowrap p-4 text-center text-sm font-normal text-gray-900"></td>
          <td className="space-x-2 whitespace-nowrap p-4 text-center">
            <div className="h-12" />
          </td>
        </tr>
      ))}
    </>
  );
}

interface Props {
  jobs: JobEntityListItem[] | undefined;
  isLoading: boolean;
  pageSize: number;
}

function JobsTable({ jobs, pageSize }: Props) {
  return (
    <Content>
      <table className="w-full table-fixed divide-y divide-gray-200">
        <TableHeader />
        <tbody className="divide-y divide-gray-200 bg-white">
          {(jobs || []).map((o, i) => (
            <TableRow key={i} job={o} />
          ))}
          <TableEmptyRows count={pageSize - (jobs || []).length} />
        </tbody>
      </table>
    </Content>
  );
}

export default JobsTable;
