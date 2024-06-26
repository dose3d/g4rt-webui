import React, { useEffect } from 'react';
import { HierarchyPainter } from 'jsroot';
import { RootCellContent, parseRootCell } from './rootCellCommons';
import { WorkspaceCellEntity } from '../../../../api/workspaceCells';
import { useRootFileDownload } from "../../../../api/rootFile";

function RenderRootCell({ fileId, path, height, pos }: RootCellContent & { pos: number }) {
  const id = `cell_${pos}`;

  const { data: rootFile, isSuccess } = useRootFileDownload(fileId);

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

function RootCell({ cell: { content, pos } }: { cell: WorkspaceCellEntity }) {
  try {
    const { fileId, path, height } = parseRootCell(content);
    return <RenderRootCell fileId={fileId} path={path} height={height} pos={pos} />;
  } catch (e) {
    return <div className="w-full">{`Error: ${e}`}</div>;
  }
}

export default RootCell;
