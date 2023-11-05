import React from 'react';
import { useWorkspaceCellCAddNew, useWorkspaceCellList } from '../../../api/workspaceCells';
import { WorkspaceEntity } from '../../../api/workspaces';
import { WorkspaceCell } from './WorkspaceCell';
import ActionButton from '../../../components/ActionButton';
import { AddIcon } from '../../../components/icons';
import { useCounter } from 'usehooks-ts';
import { PlusIcon } from '@heroicons/react/24/outline';

interface MiddleInsertCellProps {
  workspaceId: number;
  pos: number;
}

function MiddleInsertCell({ workspaceId, pos }: MiddleInsertCellProps) {
  const addMarkdownCell = useWorkspaceCellCAddNew(workspaceId, 'm', pos);
  const addDose3DCell = useWorkspaceCellCAddNew(workspaceId, 'd', pos);
  const addROOTCell = useWorkspaceCellCAddNew(workspaceId, 'r', pos);

  return (
    <div className="group flex h-8 justify-center">
      <ActionButton
        className="btn btn-xs m-1 hidden group-hover:inline-flex"
        drf={addMarkdownCell}
        icon={<PlusIcon className="h-4 w-4" />}
      >
        note cell
      </ActionButton>
      <ActionButton
        className="btn btn-xs m-1 hidden group-hover:inline-flex"
        drf={addROOTCell}
        icon={<PlusIcon className="h-4 w-4" />}
      >
        root cell
      </ActionButton>
      <ActionButton
        className="btn btn-xs m-1 hidden group-hover:inline-flex"
        drf={addDose3DCell}
        icon={<PlusIcon className="h-4 w-4" />}
      >
        dose3d cell
      </ActionButton>
    </div>
  );
}

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
      <div className="mb-8">
        <ActionButton className="btn btn-success" drf={addMarkdownCell} icon={<AddIcon className="h-6 w-6" />}>
          note cell
        </ActionButton>

        <ActionButton className="btn btn-info ml-2" drf={addROOTCell} icon={<AddIcon className="h-6 w-6" />}>
          ROOT cell
        </ActionButton>

        <ActionButton className="btn btn-warning ml-2" drf={addDose3DCell} icon={<AddIcon className="h-6 w-6" />}>
          Dose3D cell
        </ActionButton>
      </div>

      {data.map((o, i) => (
        <RerenderFixContext.Provider key={i} value={increment}>
          <WorkspaceCell cell={o} />
          <MiddleInsertCell workspaceId={workspace.id} pos={o.pos + 1} />
        </RerenderFixContext.Provider>
      ))}

      <div className="mt-8">
        <ActionButton className="btn btn-success" drf={addMarkdownCell} icon={<AddIcon className="h-6 w-6" />}>
          note cell
        </ActionButton>

        <ActionButton className="btn btn-info ml-2" drf={addROOTCell} icon={<AddIcon className="h-6 w-6" />}>
          ROOT cell
        </ActionButton>

        <ActionButton className="btn btn-warning ml-2" drf={addDose3DCell} icon={<AddIcon className="h-6 w-6" />}>
          Dose3D cell
        </ActionButton>
      </div>
    </div>
  );
}
