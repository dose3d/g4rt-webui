import React from 'react';
import { WorkspaceCellEntity } from '../../../api/workspaceCells';
import cn from 'classnames';
import { useBoolean } from 'usehooks-ts';
import RootCell from './root/RootCell';
import MarkdownCell from './note/MarkdownCell';
import EditRootCell from './root/EditRootCell';
import EditMarkdownCell from './note/EditMarkdownCell';
import { EditCellProps } from './cellCommons';
import EditDose3dCell from './dose3d/EditDose3dCell';
import Dose3dCell from './dose3d/Dose3dCell';
import {
  ArrowDownIcon,
  ArrowUpIcon,
  DocumentDuplicateIcon,
  PencilSquareIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

function EditCell({ cell, onLeave }: EditCellProps) {
  if (cell.type === 'r') {
    return <EditRootCell cell={cell} onLeave={onLeave} />;
  } else if (cell.type === 'd') {
    return <EditDose3dCell cell={cell} onLeave={onLeave} />;
  } else {
    return <EditMarkdownCell cell={cell} onLeave={onLeave} />;
  }
}

interface Props {
  cell: WorkspaceCellEntity;
}

function RenderCell({ cell }: Props) {
  const { type } = cell;
  if (type === 'r') {
    return <RootCell cell={cell} />;
  } else if (type === 'd') {
    return <Dose3dCell cell={cell} />;
  } else {
    return <MarkdownCell cell={cell} />;
  }
}

const iconClass = 'h-6 w-6 p-1 hover:text-black hover:bg-gray-100';

export function WorkspaceCell({ cell }: Props) {
  const { value: edit, setTrue: setEdit, setFalse: stopEdit } = useBoolean(false);

  const { type } = cell;

  return (
    <div className="relative my-1 flex flex-row">
      <div className="basis-12 pt-1 text-center font-mono">[{cell.pos}]</div>
      <div
        className={cn('grow p-1', {
          'border border-gray-300': !edit,
          'bg-green-50': !edit && type === 'm',
          'bg-orange-50': !edit && type === 'd',
          'bg-blue-50': !edit && type === 'r',
        })}
      >
        {edit ? <EditCell cell={cell} onLeave={stopEdit} /> : <RenderCell cell={cell} />}
      </div>
      <div className="absolute end-0 top-0 text-xs">
        <div className="grid grid-cols-5 p-0.5">
          <PencilSquareIcon className={iconClass} onClick={setEdit} title="Edit" />
          <ArrowUpIcon className={iconClass} title="Move cell up" />
          <ArrowDownIcon className={iconClass} title="Move cell down" />
          <DocumentDuplicateIcon className={iconClass} title="Duplicate cell" />
          <TrashIcon className={iconClass} title="Remove cell" />
        </div>
      </div>
    </div>
  );
}
