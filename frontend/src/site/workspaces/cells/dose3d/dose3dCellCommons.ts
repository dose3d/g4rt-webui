export interface Dose3dCellContent {
  fileId: number;
  path: string;
  height: number;
  width: number;
}

export function parseDose3dCell(content: string): Dose3dCellContent {
  try {
    const { fileId, path, height, width } = JSON.parse(content) as Partial<Dose3dCellContent>;
    return {
      fileId: parseInt(`${fileId || 0}`),
      path: path || '',
      height: parseInt(`${height || 400}`),
      width: parseInt(`${width || 400}`),
    };
  } catch {
    return { path: '', height: 400, width: 400, fileId: 0 };
  }
}
