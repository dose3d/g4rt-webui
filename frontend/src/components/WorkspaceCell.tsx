import React, { useEffect, useState } from 'react';
import { useWorkspaceCellForm, WorkspaceCellEntity } from '../api/workspaceCells';
import cn from 'classnames';

interface EditCellProps {
  cell: WorkspaceCellEntity;
  onLeave: () => void;
}

function EditCell({ cell, onLeave }: EditCellProps) {
  const {
    handleSubmitShort,
    form: { register, setFocus },
  } = useWorkspaceCellForm(cell);

  useEffect(() => setFocus('content'), [setFocus]);

  return (
    <form onSubmit={handleSubmitShort}>
      <textarea
        {...register('content', {
          onBlur: () => {
            handleSubmitShort().then();
            onLeave();
          },
        })}
        className="textarea-bordered textarea w-full"
      />
    </form>
  );
}

interface Props {
  cell: WorkspaceCellEntity;
}

export function WorkspaceCell({ cell }: Props) {
  const [edit, setEdit] = useState(false);

  return (
    <div className="relative my-1 flex flex-row">
      <div className="basis-12 pt-1 text-center font-mono">[{cell.pos}]</div>
      <div className={cn('grow p-1', { 'border border-gray-300': !edit })}>
        {edit ? <EditCell cell={cell} onLeave={() => setEdit(false)} /> : <pre>{cell.content}</pre>}
      </div>
      <div className="absolute end-0 top-0 text-xs">
        <span onClick={() => setEdit(true)}>Edit</span> | Move up | Move down | Insert above | Insert below | Delete
      </div>
    </div>
  );
}
