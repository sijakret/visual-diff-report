export interface VisualDiffImage {
  baseline?: string;
  current?: string;
  diff?: string;
  folder: string[];
}

export interface VisualDiffReportDB {
  title: string;
  rootDir: string;
  images: Record<string, VisualDiffImage>;
}
