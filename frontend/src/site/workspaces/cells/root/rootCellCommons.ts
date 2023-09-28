export interface RootCellContent {
  fileId: number;
  path: string;
  height: number;
}

export function parseRootCell(content: string): RootCellContent {
  try {
    const { fileId, path, height } = JSON.parse(content) as Partial<RootCellContent>;
    return {
      fileId: parseInt(`${fileId || 0}`),
      path: path || '',
      height: parseInt(`${height || 400}`),
    };
  } catch {
    return { path: '', height: 400, fileId: 0 };
  }
}
