export enum TaskType {
  BUG = 'BUG',
  FEATURE = 'FEATURE',
  TASK = 'TASK',
}

export type getTaskQueryType = {
  columnId?: string;
  type?: TaskType;
};
