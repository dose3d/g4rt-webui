import React from 'react';
import { useWorkspaceCellCreate, useWorkspaceCellList } from '../../../api/workspaceCells';
import { WorkspaceEntity } from '../../../api/workspaces';
import { WorkspaceCell } from './WorkspaceCell';
import ActionButton from '../../../components/ActionButton';
import { AddIcon } from '../../../components/icons';
import { useCounter } from 'usehooks-ts';
import { PlusIcon } from '@heroicons/react/24/outline';

const DEFAULT_ROOT_CONTENT = JSON.stringify({ fileId: 0, path: '', height: 400 });
const DEFAULT_DOSE3D_CONTENT = JSON.stringify({ height: 400, width: 400 });

interface MiddleInsertCellProps {
  workspaceId: number;
  pos: number;
}

function MiddleInsertCell({ workspaceId, pos }: MiddleInsertCellProps) {
  const addMarkdownCell = useWorkspaceCellCreate(workspaceId, 'm', pos);
  const addDose3DCell = useWorkspaceCellCreate(workspaceId, 'd', pos, DEFAULT_ROOT_CONTENT);
  const addROOTCell = useWorkspaceCellCreate(workspaceId, 'r', pos, DEFAULT_DOSE3D_CONTENT);

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
  const addMarkdownCell = useWorkspaceCellCreate(workspace.id, 'm');
  const addDose3DCell = useWorkspaceCellCreate(workspace.id, 'd', undefined, DEFAULT_DOSE3D_CONTENT);
  const addROOTCell = useWorkspaceCellCreate(workspace.id, 'r', undefined, DEFAULT_ROOT_CONTENT);

  const { increment } = useCounter(1); // FIX: force to rerender cells component

  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {data.map((o, i) => (
        <RerenderFixContext.Provider key={i} value={increment}>
          <MiddleInsertCell workspaceId={workspace.id} pos={o.pos - 1} />
          <WorkspaceCell cell={o} number={i + 1} />
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
