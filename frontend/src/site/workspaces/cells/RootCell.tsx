import React, { useEffect } from 'react';
import { useJobRootFileDownload } from '../../../api/jobsRootFile';
import { HierarchyPainter } from 'jsroot';
import { JsonCellContent, parseRootCell } from './rootCellCommons';

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

export default RootCell;
