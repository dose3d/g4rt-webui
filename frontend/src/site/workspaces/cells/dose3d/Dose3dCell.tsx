import React, { useEffect } from 'react';
import { HierarchyPainter } from 'jsroot';
import { Dose3dCellContent, parseDose3dCell } from './dose3dCellCommons';
import {
  useWorkspaceCellEntity,
  useWorkspaceCellRootFileDownload,
  WorkspaceCellEntity,
} from '../../../../api/workspaceCells';

interface RenderDose3dPlotProps {
  rootFile?: ArrayBuffer;
  cellId: string;
  path: string;
  isSuccess: boolean;
}

function RenderDose3dPlot({ rootFile, cellId, path, isSuccess }: RenderDose3dPlotProps) {
  useEffect(() => {
    let h: any = null;

    if (isSuccess && rootFile) {
      h = new HierarchyPainter();
      h.setDisplay('simple', cellId);
      h.openRootFile(rootFile).then(() => h.display(path, '', true));
    }

    return () => {
      h?.cleanup();
    };
  }, [isSuccess, cellId, path, rootFile]);

  return <></>;
}

function RenderDose3dCell({
  height,
  width,
  CLayer,
  MLayer,
  cellData,
}: Dose3dCellContent & { cellData: WorkspaceCellEntity }) {
  const { pos, id: wcId } = cellData;
  const id = `cell_${pos}`;

  const { data: rootFile, isSuccess } = useWorkspaceCellRootFileDownload(wcId, CLayer, MLayer);

  const plots: string[] = [];
  for (const key in cellData!.json_info) {
    const v = cellData.json_info[key].detector_layout;
    if (v.CLayer.includes(CLayer) && v.MLayer.includes(MLayer)) {
      plots.push(`File_${key}_Dose3D_MLayer_${MLayer}_CLayer_${CLayer}`);
    }
  }

  return (
    <div className="mt-4 flex flex-row">
      {plots.map((o, i) => (
        <div key={i} id={`${id}_${i}`} className="p-2" style={{ height, width }}>
          <RenderDose3dPlot rootFile={rootFile} cellId={`${id}_${i}`} path={o} isSuccess={isSuccess} />
        </div>
      ))}
    </div>
  );
}

function Dose3dCell({ cell: { id, content } }: { cell: WorkspaceCellEntity }) {
  const { data, isSuccess } = useWorkspaceCellEntity(id);

  if (data && isSuccess) {
    try {
      const { MLayer, CLayer, height, width } = parseDose3dCell(content);
      return <RenderDose3dCell height={height} width={width} CLayer={CLayer} MLayer={MLayer} cellData={data} />;
    } catch (e) {
      return <div className="w-full">{`Error: ${e}`}</div>;
    }
  } else {
    return <div className="w-full">Loading...</div>;
  }
}

export default Dose3dCell;
