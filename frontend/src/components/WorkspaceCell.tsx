import React, { useEffect } from 'react';
import { useWorkspaceCellForm, WorkspaceCellEntity } from '../api/workspaceCells';
import cn from 'classnames';
import { HierarchyPainter } from 'jsroot';
import { useJobRootFileDownload } from '../api/jobsRootFile';
import ReactMarkdown from 'react-markdown';
import { useBoolean } from 'usehooks-ts';

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
    const { fileId, path, height } = JSON.parse(content) as JsonCellContent;
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
