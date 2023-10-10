import React, { useEffect } from 'react';
import { useJobRootFileDownload } from '../../../../api/jobsRootFile';
import { HierarchyPainter } from 'jsroot';
import { Dose3dCellContent, parseDose3dCell } from './dose3dCellCommons';
import Plot from "react-plotly.js";


function RenderDose3dCell({ fileId, path, height, pos }: Dose3dCellContent & { pos: number }) {
  /*const id = `cell_${pos}`;

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
  );*/
  return (
    <Plot
      data={[
        {
          x: [1, 2, 3],
          y: [2, 6, 3],
          type: 'scatter',
          mode: 'lines+markers',
          marker: {color: 'red'},
        },
        {type: 'bar', x: [1, 2, 3], y: [2, 5, 3]},
      ]}
      layout={ {width: 320, height, title: 'A Fancy Plot'} }
    />
  );
}

function Dose3dCell({ content, pos }: { content: string; pos: number }) {
  try {
    const { fileId, path, height, width } = parseDose3dCell(content);
    return <RenderDose3dCell fileId={fileId} path={path} height={height} pos={pos} width={width} />;
  } catch (e) {
    return <div className="w-full">{`Error: ${e}`}</div>;
  }
}

export default Dose3dCell;
