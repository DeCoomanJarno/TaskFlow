// task.model.ts
export interface Task {
  id: number;
  title: string;
  description: string;
  color_id: number;
  project_id: number;
  category_id: number;
  column_id: number;        
  swimlane_id: number;      
  position: number;      
  owner_id: number;
  owner_name: string;
  is_active: number;
  date_creation: number;
  date_completed: number;
  date_modification: number;
  priority: number;
  tags?: string[];
}

// Helper interface for column mapping
export interface ColumnMapping {
  status: 'new' | 'in-progress' | 'completed';
  kanboardColumnId: number;
  title: string;
  color: string;
  icon: string;
}