import { useJobRootFileList } from '../../../../api/jobsRootFile';
import { useForm } from 'react-hook-form';
import { useWorkspaceRootCellUpdate } from '../../../../api/workspaceCells';
import React, { useCallback, useContext, useEffect } from 'react';
import { RerenderFixContext } from '../WorkspaceCells';
import { CSelect, CTextInput, SelectOptions } from '../../../../components/forms';
import { HierarchyPainter } from 'jsroot';
import { EditCellProps } from '../cellCommons';
import { RootCellContent, parseRootCell } from './rootCellCommons';
import { useRootFileDownload, useRootFileListForSelect } from "../../../../api/rootFile";

interface RenderRootEditProps extends RootCellContent {
  pos: number;
  onDisplay: (path: string) => void;
}

function RenderRootEdit({ fileId, path, height, pos, onDisplay }: RenderRootEditProps) {
  const id = `cell_${pos}`;

  const { data: rootFile, isSuccess } = useRootFileDownload(fileId);

  useEffect(() => {
    let h: any = null;
    if (isSuccess && rootFile) {
      h = new HierarchyPainter(id, `hp_${id}`);
      h.setOnDisplay(onDisplay);
      h.setDisplay('simple', id);
      h.openRootFile(rootFile).then(() => {
        if (path) {
          h.display(path, '', true);
        }
      });
    }

    return () => {
      h?.cleanup();
    };
  }, [id, isSuccess, onDisplay, path, rootFile]);

  return (
    <div className="mt-4 flex gap-4">
      <div id={`hp_${id}`} className="w-96"></div>
      <div id={id} className="w-full grow" style={{ height }} />
    </div>
  );
}

function EditRootCell({ cell, onLeave }: EditCellProps) {

  const { data } = useJobRootFileList();
  const { data: rootFiles} = useRootFileListForSelect();

  const parsedCell = parseRootCell(cell.content);
  const { control, watch, handleSubmit, setValue } = useForm<RootCellContent>({ defaultValues: parsedCell });
  const { mutateAsync } = useWorkspaceRootCellUpdate(cell);
  const rerender = useContext(RerenderFixContext); // FIX: force to rerender cells component

  const onSubmit = useCallback(
    (values: RootCellContent) => {
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

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid grid-cols-5 gap-4">
        <CSelect control={control} name="fileId" title="Load result from ROOT:">
          <>
          {data && (
              <SelectOptions
                options={data}
                labelValue={(o) => ({ label: `Job #${o.job.id}: ${o.job.title}`, value: `${o.id}` })}
                nullValue
              />
          )}
            {rootFiles && (
              <SelectOptions
                options={rootFiles}
                labelValue={(o) => ({ label: `ROOT #${o.id}: ${o.title}`, value: `r${o.id}` })}
                nullValue
              />
            )}
        </>
        </CSelect>
        <div className="col-span-2">
          <CTextInput control={control} name="path" title="Data path to render:" />
        </div>
        <CTextInput control={control} name="height" title="Height of cell:" type="number" />
        <button type="submit" className="btn btn-primary mb-4 mt-auto">
          Save
        </button>
      </div>
      {watch('fileId') && (
        <RenderRootEdit
          pos={cell.pos}
          height={watch('height')}
          path={parsedCell.path || ''}
          fileId={watch('fileId')}
          onDisplay={onChangePath}
        />
      )}
    </form>
  );
}
export default EditRootCell;
