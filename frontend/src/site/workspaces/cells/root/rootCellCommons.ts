export interface RootCellContent {
  fileId: string;
  path: string;
  height: number;
}

export function parseRootCell(content: string): RootCellContent {
  try {
    const { fileId, path, height } = JSON.parse(content) as Partial<RootCellContent>;
    return {
      fileId: fileId || '',
      path: path || '',
      height: parseInt(`${height || 400}`),
    };
  } catch {
    return { path: '', height: 400, fileId: '' };
  }
}
