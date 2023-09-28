import React from 'react';
import { CellType, WorkspaceCellEntity } from '../../../api/workspaceCells';
import cn from 'classnames';
import { useBoolean } from 'usehooks-ts';
import RootCell from './RootCell';
import MarkdownCell from './MarkdownCell';
import EditRootCell from './EditRootCell';
import EditMarkdownCell from './EditMarkdownCell';
import { EditCellProps } from './cellCommons';

function EditCell({ cell, onLeave }: EditCellProps) {
  if (cell.type === 'r') {
    return <EditRootCell cell={cell} onLeave={onLeave} />;
  } else {
    return <EditMarkdownCell cell={cell} onLeave={onLeave} />;
  }
}

interface Props {
  cell: WorkspaceCellEntity;
}

function RenderCell({ content, type, pos }: { content: string; type: CellType; pos: number }) {
  if (type === 'r') {
    return <RootCell content={content} pos={pos} />;
  } else {
    return <MarkdownCell content={content} />;
  }
}

export function WorkspaceCell({ cell }: Props) {
  const { value: edit, setTrue: setEdit, setFalse: stopEdit } = useBoolean(false);

  const { content, type, pos } = cell;

  return (
    <div className="relative my-1 flex flex-row">
      <div className="basis-12 pt-1 text-center font-mono">[{cell.pos}]</div>
      <div className={cn('grow p-1', { 'border border-gray-300': !edit, 'bg-gray-50': !edit && type !== 'r' })}>
        {edit ? <EditCell cell={cell} onLeave={stopEdit} /> : <RenderCell content={content} type={type} pos={pos} />}
      </div>
      <div className="absolute end-0 top-0 text-xs">
        <span onClick={setEdit}>Edit</span> | Move up | Move down | Insert above | Insert below | Delete
      </div>
    </div>
  );
}
