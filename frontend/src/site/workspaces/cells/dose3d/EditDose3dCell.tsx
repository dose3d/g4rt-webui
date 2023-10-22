import { useForm } from 'react-hook-form';
import { useWorkspaceRootCellUpdate } from '../../../../api/workspaceCells';
import React, { useCallback, useContext } from 'react';
import { RerenderFixContext } from '../WorkspaceCells';
import { CTextInput } from '../../../../components/forms';
import { EditCellProps } from '../cellCommons';
import { Dose3dCellContent, parseDose3dCell } from './dose3dCellCommons';
import Dose3dCell from './Dose3dCell';

function EditDose3dCell({ cell, onLeave }: EditCellProps) {
  const parsedCell = parseDose3dCell(cell.content);
  const { control, watch, handleSubmit, setValue } = useForm<Dose3dCellContent>({ defaultValues: parsedCell });
  const { mutateAsync } = useWorkspaceRootCellUpdate(cell);
  const rerender = useContext(RerenderFixContext); // FIX: force to rerender cells component

  const onSubmit = useCallback(
    (values: Dose3dCellContent) => {
      const content = JSON.stringify(values);
      mutateAsync({ content }).then(() => {
        rerender(); // FIX: force to rerender cells component
      });
      onLeave();
    },
    [mutateAsync, onLeave, rerender],
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid grid-cols-6 gap-4">
        <CTextInput control={control} name="MLayer" title="MLayer:" type="number" />
        <CTextInput control={control} name="CLayer" title="CLayer:" type="number" />
        <CTextInput control={control} name="width" title="Width of cell:" type="number" />
        <CTextInput control={control} name="height" title="Height of cell:" type="number" />
        <button type="submit" className="btn btn-primary mb-4 mt-auto">
          Save
        </button>
      </div>
      <Dose3dCell
        cell={{
          ...cell,
          content: JSON.stringify({
            height: watch('height'),
            width: watch('width'),
            MLayer: watch('MLayer'),
            CLayer: watch('CLayer'),
          }),
        }}
      />
    </form>
  );
}
export default EditDose3dCell;
