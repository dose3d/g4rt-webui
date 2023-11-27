import React from 'react';
import { Link } from 'react-router-dom';
import { RootFileEntity, useRootFileDelete } from '../../api/rootFile';
import { ArrowTopRightOnSquareIcon, CloseIcon, DeleteIcon } from '../../components/icons';
import { Content } from '../../components/layout';
import ActionButton from '../../components/ActionButton';

function TableHeader() {
  return (
    <thead className="bg-gray-100">
      <tr>
        <th scope="col" className="w-16 p-4 text-center text-xs font-medium uppercase text-gray-500">
          ID
        </th>
        <th scope="col" className="w-64 p-4 text-center text-xs font-medium uppercase text-gray-500 md:w-full">
          ROOT File
        </th>
        <th scope="col" className="w-32 p-4 text-center text-xs font-medium uppercase text-gray-500">
          Details
        </th>
      </tr>
    </thead>
  );
}

interface RootFilesTableRow {
  entity: RootFileEntity;
}

function TableRow({ entity: { id, title, description } }: RootFilesTableRow) {
  const deleteAction = useRootFileDelete(id);

  return (
    <tr className="hover:bg-gray-100">
      <td className="whitespace-nowrap p-4 text-right text-base font-medium text-gray-900">#{id}</td>
      <td className="whitespace-nowrap p-4 text-sm font-normal text-gray-500">
        <div className="overflow-hidden text-ellipsis text-base font-semibold text-gray-900">{title}</div>
        <div className="overflow-hidden text-ellipsis text-sm font-normal text-gray-500">{description}</div>
      </td>
      <td className="space-x-2 whitespace-nowrap p-4 text-center">
        <ActionButton
          className="btn btn-ghost btn-sm"
          drf={deleteAction}
          title="Remove uploaded ROOT file"
          confirm="Are you sure to remove this ROOT file?"
          mutateOptions={{
            onSuccess: () => {
              //navigate('/jobs/');
            },
          }}
        >
          <DeleteIcon />
        </ActionButton>
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
          <td className="space-x-2 whitespace-nowrap p-4 text-center">
            <div className="h-12" />
          </td>
        </tr>
      ))}
    </>
  );
}

interface Props {
  entities: RootFileEntity[] | undefined;
  isLoading: boolean;
  pageSize: number;
}

function RootFilesTable({ entities, pageSize }: Props) {
  return (
    <Content>
      <table className="w-full table-fixed divide-y divide-gray-200">
        <TableHeader />
        <tbody className="divide-y divide-gray-200 bg-white">
          {(entities || []).map((o, i) => (
            <TableRow key={i} entity={o} />
          ))}
          <TableEmptyRows count={pageSize - (entities || []).length} />
        </tbody>
      </table>
    </Content>
  );
}

export default RootFilesTable;
