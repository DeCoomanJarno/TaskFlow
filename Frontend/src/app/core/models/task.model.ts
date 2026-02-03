// task.model.ts
export interface Task {
  id: number;
  title: string;
  description: string;
  columnId: number;
  order: number;
  priority: number;
  projectId: number;
  assignedUserId: number;
  assignedUserName: string;
  completedDate?: number;
}

// Helper interface for column mapping
export interface ColumnMapping {
  status: 'new' | 'in-progress' | 'completed';
  kanboardColumnId: number;
  title: string;
  color: string;
  icon: string;
}