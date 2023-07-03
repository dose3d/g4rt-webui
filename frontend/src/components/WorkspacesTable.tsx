import React from 'react';
import { Link } from 'react-router-dom';
import { WorkspaceEntity } from '../api/workspaces';
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
          Workspace title
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

interface WorkspaceTableRow {
  workspace: WorkspaceEntity;
}

function TableRow({ workspace: { id, title, description, updated_at, created_at } }: WorkspaceTableRow) {
  return (
    <tr className="hover:bg-gray-100">
      <td className="whitespace-nowrap p-4 text-right text-base font-medium text-gray-900">#{id}</td>
      <td className="whitespace-nowrap p-4 text-sm font-normal text-gray-500">
        <Link to={`/workspaces/${id}`}>
          <div className="overflow-hidden text-ellipsis text-base font-semibold text-gray-900">{title}</div>
          <div className="overflow-hidden text-ellipsis text-sm font-normal text-gray-500">{description}</div>
        </Link>
      </td>
      <td className="whitespace-nowrap p-4 text-center text-sm font-normal text-gray-900">{formatDate(created_at)}</td>
      <td className="whitespace-nowrap p-4 text-center text-sm font-normal text-gray-900">{formatDate(updated_at)}</td>
      <td className="space-x-2 whitespace-nowrap p-4 text-center">
        <Link to={`/workspaces/${id}`} data-modal-toggle="product-modal" className="btn-ghost btn h-12">
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
  workspaces: WorkspaceEntity[] | undefined;
  isLoading: boolean;
  pageSize: number;
}

function WorkspacesTable({ workspaces, pageSize }: Props) {
  return (
    <Content>
      <table className="w-full table-fixed divide-y divide-gray-200">
        <TableHeader />
        <tbody className="divide-y divide-gray-200 bg-white">
          {(workspaces || []).map((o, i) => (
            <TableRow key={i} workspace={o} />
          ))}
          <TableEmptyRows count={pageSize - (workspaces || []).length} />
        </tbody>
      </table>
    </Content>
  );
}

export default WorkspacesTable;
