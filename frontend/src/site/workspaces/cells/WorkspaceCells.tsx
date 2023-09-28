import React from 'react';
import { useWorkspaceCellCAddNew, useWorkspaceCellList } from '../../../api/workspaceCells';
import { WorkspaceEntity } from '../../../api/workspaces';
import { WorkspaceCell } from './WorkspaceCell';
import ActionButton from '../../../components/ActionButton';
import { AddIcon } from '../../../components/icons';
import { useCounter } from 'usehooks-ts';

interface Props {
  workspace: WorkspaceEntity;
}

// FIX: force to rerender cells component
export const RerenderFixContext = React.createContext(() => {});

export function WorkspaceCells({ workspace }: Props) {
  const { data } = useWorkspaceCellList(workspace.id);
  const addMarkdownCell = useWorkspaceCellCAddNew(workspace.id, 'm');
  const addDose3DCell = useWorkspaceCellCAddNew(workspace.id, 'd');
  const addROOTCell = useWorkspaceCellCAddNew(workspace.id, 'r');

  const { increment } = useCounter(1); // FIX: force to rerender cells component

  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {data.map((o, i) => (
        <RerenderFixContext.Provider key={i} value={increment}>
          <WorkspaceCell cell={o} />
        </RerenderFixContext.Provider>
      ))}

      <ActionButton className="btn-info btn" drf={addROOTCell} icon={<AddIcon className="h-6 w-6" />}>
        Add ROOT cell
      </ActionButton>

      <ActionButton className="btn-error btn ml-2" drf={addDose3DCell} icon={<AddIcon className="h-6 w-6" />}>
        Add Dose3D cell
      </ActionButton>

      <ActionButton className="btn-warning btn ml-2" drf={addMarkdownCell} icon={<AddIcon className="h-6 w-6" />}>
        Add description cell
      </ActionButton>
    </div>
  );
}
