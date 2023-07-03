import React from 'react';
import { WorkspaceCellEntity } from '../api/workspaceCells';

interface Props {
  cell: WorkspaceCellEntity;
}

export function WorkspaceCell({ cell }: Props) {
  return (
    <div>
      Mockup of cell: #{cell.pos}
      <br />
      Cell type: {cell.type}
      <br />
      Cell content:
      <pre>{cell.content}</pre>
    </div>
  );
}
