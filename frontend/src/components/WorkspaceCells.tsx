import React from 'react';
import { useWorkspaceCellCAddNew, useWorkspaceCellList } from '../api/workspaceCells';
import { WorkspaceEntity } from '../api/workspaces';
import { WorkspaceCell } from './WorkspaceCell';
import ActionButton from './ActionButton';
import { AddIcon } from './icons';

interface Props {
  workspace: WorkspaceEntity;
}

export function WorkspaceCells({ workspace }: Props) {
  const { data } = useWorkspaceCellList(workspace.id);
  const addMarkdownCell = useWorkspaceCellCAddNew(workspace.id, 'm');
  const addROOTCell = useWorkspaceCellCAddNew(workspace.id, 'j');

  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {data.map((o, i) => (
        <WorkspaceCell cell={o} key={i} />
      ))}

      <ActionButton className="btn-info btn" drf={addROOTCell} icon={<AddIcon className="h-6 w-6" />}>
        Add ROOT cell
      </ActionButton>

      <ActionButton className="btn-warning btn ml-2" drf={addMarkdownCell} icon={<AddIcon className="h-6 w-6" />}>
        Add description cell
      </ActionButton>
    </div>
  );
}
