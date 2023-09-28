export interface JsonCellContent {
  fileId: number;
  path: string;
  height: number;
}

export function parseRootCell(content: string): JsonCellContent {
  try {
    const { fileId, path, height } = JSON.parse(content) as Partial<JsonCellContent>;
    return {
      fileId: parseInt(`${fileId || 0}`),
      path: path || '',
      height: parseInt(`${height || 400}`),
    };
  } catch {
    return { path: '', height: 400, fileId: 0 };
  }
}
