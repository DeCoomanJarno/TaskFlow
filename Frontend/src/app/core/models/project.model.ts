export interface Project {
  id?: number;
  name: string;
  description?: string;
  parentProjectId?: number | null;
  isActive: boolean;
  endDate: string;
}
