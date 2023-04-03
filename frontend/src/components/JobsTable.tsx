import React from 'react';
import { Link } from 'react-router-dom';
import { JobEntity } from '../api/jobs';
import { EditIcon } from './icons';
import moment from 'moment';

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
  job: JobEntity;
}

function formatDate(drf: string) {
  return moment(drf).format('YYYY-MM-DD HH:mm');
}

function TableRow({ job: { id, title, description, status, is_error, updated_at, created_at } }: JobTableRow) {
  return (
    <tr className="hover:bg-gray-100">
      <td className="whitespace-nowrap p-4 text-right text-base font-medium text-gray-900">#{id}</td>
      <td className="whitespace-nowrap p-4 text-sm font-normal text-gray-500">
        <Link to={`/jobs/${id}`}>
          <div className="overflow-hidden text-ellipsis text-base font-semibold text-gray-900">{title}</div>
          <div className="overflow-hidden text-ellipsis text-sm font-normal text-gray-500">{description}</div>
        </Link>
      </td>
      <td className="whitespace-nowrap p-4 text-center text-base font-medium text-gray-900">{status}</td>
      <td className="whitespace-nowrap p-4 text-center text-sm font-normal text-gray-900">{formatDate(created_at)}</td>
      <td className="whitespace-nowrap p-4 text-center text-sm font-normal text-gray-900">{formatDate(updated_at)}</td>
      <td className="space-x-2 whitespace-nowrap p-4 text-center">
        <Link to={`/jobs/${id}`} data-modal-toggle="product-modal" className="btn-ghost btn">
          <EditIcon />
        </Link>
      </td>
    </tr>
  );
}

interface Props {
  jobs: JobEntity[] | undefined;
  isLoading: boolean;
}

function JobsTable({ jobs }: Props) {
  return (
    <div className="flex flex-col">
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden shadow">
            <table className="w-full table-fixed divide-y divide-gray-200">
              <TableHeader />
              <tbody className="divide-y divide-gray-200 bg-white">
                {(jobs || []).map((o, i) => (
                  <TableRow key={i} job={o} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default JobsTable;