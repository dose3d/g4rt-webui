import { useWorkspaceCellForm } from '../../../api/workspaceCells';
import React, { useEffect } from 'react';
import { EditCellProps } from './cellCommons';

function EditMarkdownCell({ cell, onLeave }: EditCellProps) {
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
        className="textarea textarea-bordered h-48 w-full font-mono leading-tight"
      />
    </form>
  );
}

export default EditMarkdownCell;
