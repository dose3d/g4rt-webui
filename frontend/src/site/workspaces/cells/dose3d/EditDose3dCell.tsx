import { useForm } from 'react-hook-form';
import { Dose3DCellInfo, useWorkspaceCellEntity, useWorkspaceRootCellUpdate } from '../../../../api/workspaceCells';
import React, { useCallback, useContext, useMemo } from 'react';
import { RerenderFixContext } from '../WorkspaceCells';
import { CSelect, CTextInput, SelectOptions } from '../../../../components/forms';
import { EditCellProps } from '../cellCommons';
import { Dose3dCellContent, parseDose3dCell } from './dose3dCellCommons';
import Dose3dCell from './Dose3dCell';

function genMClayersList(src: Dose3DCellInfo) {
  const mlayer = new Set<number>();
  const clayer = new Set<number>();

  Object.keys(src).forEach((k) => {
    src[k].detector_layout.MLayer.forEach((n) => mlayer.add(n));
    src[k].detector_layout.CLayer.forEach((n) => clayer.add(n));
  });

  const MLayers = Array.from(mlayer);
  const CLayers = Array.from(clayer);

  MLayers.sort();
  CLayers.sort();

  return {
    MLayers,
    CLayers,
  };
}

function EditDose3dCell({ cell, onLeave }: EditCellProps) {
  const parsedCell = parseDose3dCell(cell.content);
  const { control, watch, handleSubmit } = useForm<Dose3dCellContent>({ defaultValues: parsedCell });
  const { mutateAsync } = useWorkspaceRootCellUpdate(cell);
  const rerender = useContext(RerenderFixContext); // FIX: force to rerender cells component
  const { data } = useWorkspaceCellEntity(cell.id);

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

  const { json_info = {} } = data || {};

  const mcLayers = useMemo(() => genMClayersList(json_info), [json_info]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid grid-cols-6 gap-4">
        <CSelect control={control} name="MLayer" title="MLayer:">
          <SelectOptions options={mcLayers.MLayers} labelValue={(o) => ({ label: `${o}`, value: `${o}` })} nullValue />
        </CSelect>

        <CSelect control={control} name="CLayer" title="CLayer:">
          <SelectOptions options={mcLayers.CLayers} labelValue={(o) => ({ label: `${o}`, value: `${o}` })} nullValue />
        </CSelect>

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
