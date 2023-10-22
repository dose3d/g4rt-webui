export interface Dose3dCellContent {
  MLayer: number;
  CLayer: number;
  height: number;
  width: number;
}

export function parseDose3dCell(content: string): Dose3dCellContent {
  try {
    const { MLayer, CLayer, height, width } = JSON.parse(content) as Partial<Dose3dCellContent>;
    return {
      MLayer: parseInt(`${MLayer || 0}`),
      CLayer: parseInt(`${CLayer || 0}`),
      height: parseInt(`${height || 400}`),
      width: parseInt(`${width || 400}`),
    };
  } catch {
    return { MLayer: 0, CLayer: 0, height: 400, width: 400 };
  }
}
