// task.model.ts
import { Comment } from './comment.model';

export interface Task {
  id: number;
  title: string;
  description: string;
  columnId: number;
  order: number;
  priority: number;
  projectId: number;
  categoryId?: number | null;
  assignedUserId?: number | null;
  assignedUserName?: string;
  completedDate?: string;
  comments?: Comment[];
}

// Helper interface for column mapping
export interface ColumnMapping {
  status: 'new' | 'in-progress' | 'completed';
  kanboardColumnId: number;
  title: string;
  color: string;
  icon: string;
}
