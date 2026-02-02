export interface Project {
  id?: number;
  name: string;
  description?: string;
  identifier?: string;
  owner_id?: number;
  start_date?: string;
  end_date?: string;
  priority_default?: number;
  priority_start?: number;
  priority_end?: number;
  email?: string;
  is_active?: number;
}
