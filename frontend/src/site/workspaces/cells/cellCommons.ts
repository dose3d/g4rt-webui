import { WorkspaceCellEntity } from "../../../api/workspaceCells";

export interface EditCellProps {
  cell: WorkspaceCellEntity;
  onLeave: () => void;
}
