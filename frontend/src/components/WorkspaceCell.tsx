import React, { useCallback, useContext, useEffect } from 'react';
import { useWorkspaceCellForm, useWorkspaceRootCellUpdate, WorkspaceCellEntity } from '../api/workspaceCells';
import cn from 'classnames';
import { HierarchyPainter } from 'jsroot';
import { useJobRootFileDownload, useJobRootFileList } from '../api/jobsRootFile';
import ReactMarkdown from 'react-markdown';
import { useBoolean } from 'usehooks-ts';
import { useForm } from 'react-hook-form';
import { CSelect, CTextInput, SelectOptions } from './forms';
import { RerenderFixContext } from './WorkspaceCells';

interface EditCellProps {
  cell: WorkspaceCellEntity;
  onLeave: () => void;
}

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
        className="textarea-bordered textarea h-48 w-full font-mono leading-tight"
      />
    </form>
  );
}

interface JsonCellContent {
  fileId: number;
  path: string;
  height: number;
}

function parseRootCell(content: string): JsonCellContent {
  try {
    const { fileId, path, height } = JSON.parse(content) as Partial<JsonCellContent>;
    return {
      fileId: parseInt(`${fileId || 0}`),
      path: path || '',
      height: parseInt(`${height || 400}`),
    };
  } catch {
    return { path: '', height: 400, fileId: 0 };
  }
}

interface RenderRootEditProps extends JsonCellContent {
  pos: number;
  onDisplay: (path: string) => void;
}

function RenderRootEdit({ fileId, path, height, pos, onDisplay }: RenderRootEditProps) {
  const id = `cell_${pos}`;

  const { data: rootFile, isSuccess } = useJobRootFileDownload(fileId);

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
  const parsedCell = parseRootCell(cell.content);
  const { control, watch, handleSubmit, setValue } = useForm<JsonCellContent>({ defaultValues: parsedCell });
  const { mutateAsync } = useWorkspaceRootCellUpdate(cell);
  const rerender = useContext(RerenderFixContext); // FIX: force to rerender cells component

  const onSubmit = useCallback(
    (values: JsonCellContent) => {
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
        <CSelect control={control} name="fileId" title="Load result from job:">
          {data && (
            <SelectOptions
              options={data}
              labelValue={(o) => ({ label: `#${o.job.id}: ${o.job.title}`, value: `${o.id}` })}
              nullValue
            />
          )}
        </CSelect>
        <div className="col-span-2">
          <CTextInput control={control} name="path" title="Data path to render:" />
        </div>
        <CTextInput control={control} name="height" title="Height of cell:" type="number" />
        <button type="submit" className="btn-primary btn mb-4 mt-auto">
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

function EditCell({ cell, onLeave }: EditCellProps) {
  if (cell.type === 'j') {
    return <EditRootCell cell={cell} onLeave={onLeave} />;
  } else {
    return <EditMarkdownCell cell={cell} onLeave={onLeave} />;
  }
}

interface Props {
  cell: WorkspaceCellEntity;
}

function RenderRootCell({ fileId, path, height, pos }: JsonCellContent & { pos: number }) {
  const id = `cell_${pos}`;

  const { data: rootFile, isSuccess } = useJobRootFileDownload(fileId);

  useEffect(() => {
    let h: any = null;
    if (isSuccess && rootFile) {
      h = new HierarchyPainter();
      h.setDisplay('simple', id);
      h.openRootFile(rootFile).then(() => h.display(path, '', true));
    }

    return () => {
      h?.cleanup();
    };
  }, [id, isSuccess, path, rootFile]);

  return (
    <div className="mt-4">
      <div id={id} className="w-full" style={{ height }} />
    </div>
  );
}

function RootCell({ content, pos }: { content: string; pos: number }) {
  try {
    const { fileId, path, height } = parseRootCell(content);
    return <RenderRootCell fileId={fileId} path={path} height={height} pos={pos} />;
  } catch (e) {
    return <div className="w-full">{`Error: ${e}`}</div>;
  }
}

function MarkdownCell({ content }: { content: string }) {
  return <ReactMarkdown className="prose w-full max-w-none">{content}</ReactMarkdown>;
}

function RenderCell({ content, type, pos }: { content: string; type: 'm' | 'j'; pos: number }) {
  if (type === 'm') {
    return <MarkdownCell content={content} />;
  } else {
    return <RootCell content={content} pos={pos} />;
  }
}

export function WorkspaceCell({ cell }: Props) {
  const { value: edit, setTrue: setEdit, setFalse: stopEdit } = useBoolean(false);

  const { content, type, pos } = cell;

  return (
    <div className="relative my-1 flex flex-row">
      <div className="basis-12 pt-1 text-center font-mono">[{cell.pos}]</div>
      <div className={cn('grow p-1', { 'border border-gray-300': !edit, 'bg-gray-50': !edit && type === 'm' })}>
        {edit ? <EditCell cell={cell} onLeave={stopEdit} /> : <RenderCell content={content} type={type} pos={pos} />}
      </div>
      <div className="absolute end-0 top-0 text-xs">
        <span onClick={setEdit}>Edit</span> | Move up | Move down | Insert above | Insert below | Delete
      </div>
    </div>
  );
}
