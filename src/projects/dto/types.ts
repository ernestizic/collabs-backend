export type ColumnType = {
  id: string;
  name: string;
  description: string | null;
  position: number;
  identifier: string | null;
  column_limit: number | null;
  projectId: number;
  createdAt: Date;
  updatedAt: Date;
};
