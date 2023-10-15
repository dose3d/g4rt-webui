import { useJobRootFileDownload, useJobRootFileList } from '../../../../api/jobsRootFile';
import { useForm } from 'react-hook-form';
import { useWorkspaceRootCellUpdate } from '../../../../api/workspaceCells';
import React, { useCallback, useContext, useEffect } from 'react';
import { RerenderFixContext } from '../WorkspaceCells';
import { CTextInput, SelectOptions } from '../../../../components/forms';
import { HierarchyPainter } from 'jsroot';
import { EditCellProps } from '../cellCommons';
import { Dose3dCellContent, parseDose3dCell } from './dose3dCellCommons';
import Plot from 'react-plotly.js';

export interface ColourOption {
  readonly value: string;
  readonly label: string;
  readonly color: string;
  readonly isFixed?: boolean;
  readonly isDisabled?: boolean;
}

export const colourOptions: readonly ColourOption[] = [
  { value: 'ocean', label: 'Ocean', color: '#00B8D9', isFixed: true },
  { value: 'blue', label: 'Blue', color: '#0052CC', isDisabled: true },
  { value: 'purple', label: 'Purple', color: '#5243AA' },
  { value: 'red', label: 'Red', color: '#FF5630', isFixed: true },
  { value: 'orange', label: 'Orange', color: '#FF8B00' },
  { value: 'yellow', label: 'Yellow', color: '#FFC400' },
  { value: 'green', label: 'Green', color: '#36B37E' },
  { value: 'forest', label: 'Forest', color: '#00875A' },
  { value: 'slate', label: 'Slate', color: '#253858' },
  { value: 'silver', label: 'Silver', color: '#666666' },
];

interface RenderDose3dEditProps extends Dose3dCellContent {
  pos: number;
  onDisplay: (path: string) => void;
}

function RenderDose3dEdit({ fileId, path, height, width, pos, onDisplay }: RenderDose3dEditProps) {
  /*const id = `cell_${pos}`;

  const { data: dose3dFile, isSuccess } = useJobRootFileDownload(fileId);

  useEffect(() => {
    let h: any = null;
    if (isSuccess && dose3dFile) {
      h = new HierarchyPainter(id, `hp_${id}`);
      h.setOnDisplay(onDisplay);
      h.setDisplay('simple', id);
      h.openRootFile(dose3dFile).then(() => {
        if (path) {
          h.display(path, '', true);
        }
      });
    }

    return () => {
      h?.cleanup();
    };
  }, [id, isSuccess, onDisplay, path, dose3dFile]);

  return (
    <div className="mt-4 flex gap-4">
      <div id={`hp_${id}`} className="w-96"></div>
      <div id={id} className="w-full grow" style={{ height }} />
    </div>
  );*/
  return (
    <Plot
      data={[
        {
          x: [1, 2, 3],
          y: [2, 6, 3],
          type: 'scatter',
          mode: 'lines+markers',
          marker: { color: 'red' },
        },
        { type: 'bar', x: [1, 2, 3], y: [2, 5, 3] },
      ]}
      layout={{ width, height, title: 'A Fancy Plot' }}
    />
  );
}

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

  const onChangePath = (path: string) => {
    setValue('path', path);
  };

  console.log(watch('fileId'));

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid grid-cols-6 gap-4">

        <div className="col-span-2">
          <CTextInput control={control} name="path" title="Data path to render:" />
        </div>
        <CTextInput control={control} name="width" title="Width of cell:" type="number" />
        <CTextInput control={control} name="height" title="Height of cell:" type="number" />
        <button type="submit" className="btn btn-primary mb-4 mt-auto">
          Save
        </button>
      </div>
      {watch('fileId') ? (
        <RenderDose3dEdit
          pos={cell.pos}
          height={watch('height')}
          width={watch('width')}
          path={parsedCell.path || ''}
          fileId={watch('fileId')}
          onDisplay={onChangePath}
        />
      ) : null}
    </form>
  );
}
export default EditDose3dCell;
/*
<CSelect control={control} name="fileId" title="Load result from job:">
          {data && (
            <>
            </>
          )}
        </CSelect>
 */
