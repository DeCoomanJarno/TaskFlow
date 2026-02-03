import { Component } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { TaskDialogComponent } from '../task-dialog/task-dialog.component';
import { TaskDetailDialogComponent } from '../task-detail-dialog/task-detail-dialog.component';
import { Task } from '../../../core/models/task.model';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { forkJoin } from 'rxjs';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { AuthService } from '../../../core/services/auth.service';

export type TaskStatus = 'new' | 'in-progress' | 'completed';
export type ViewMode = 'kanban' | 'grid' | 'list';

export interface TaskColumn {
  id: TaskStatus;
  title: string;
  tasks: Task[];
  color: string;
  icon: string;
  kanboardColumnId: number; 
}

@Component({
  selector: 'app-task-board',
  imports: [
    CommonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatTooltipModule,
    DragDropModule
  ],
  templateUrl: './task-board.component.html',
  styleUrl: './task-board.component.less'
})
export class TaskBoardComponent {
    selectedProjectId?: number;
  tasks: Task[] = [];
  viewMode: ViewMode = 'kanban';

  // Column configuration - UPDATE THESE IDs based on your Kanboard setup
  columns: TaskColumn[] = [
    {
      id: 'new',
      title: 'New',
      tasks: [],
      color: '#3b82f6',
      icon: 'fiber_new',
      kanboardColumnId: 1  // UPDATE: Your Kanboard "Backlog" or "To Do" column ID
    },
    {
      id: 'in-progress',
      title: 'In Progress',
      tasks: [],
      color: '#f59e0b',
      icon: 'sync',
      kanboardColumnId: 2  // UPDATE: Your Kanboard "In Progress" column ID
    },
    {
      id: 'completed',
      title: 'Completed',
      tasks: [],
      color: '#10b981',
      icon: 'check_circle',
      kanboardColumnId: 3  // UPDATE: Your Kanboard "Done" column ID
    }
  ];

  constructor(
    private api: ApiService,
    private dialog: MatDialog,
    private auth: AuthService
  ) {}

  ngOnInit() {
    // You can load column mappings from Kanboard API if needed
    // this.loadKanboardColumns();
  }

  loadTasks(projectId: number) {
    this.selectedProjectId = projectId;

    forkJoin({
      users: this.api.getUsers(),
      tasks: this.api.getTasks(projectId)
    }).subscribe(({ users, tasks }) => {
      this.tasks = tasks.map(task => {
        const owner = users.find(u => u.id === task.assignedUserId);
        return {
          ...task,
          assignedUserName: owner ? owner.name : 'Unassigned'
        };
      });

      this.organizeTasksByStatus();
    });
  }

  organizeTasksByStatus() {
    // Reset columns
    this.columns.forEach(column => column.tasks = []);

    // Organize tasks into columns based on their columnId from Kanboard
    this.tasks.forEach(task => {
      const column = this.columns.find(col => col.kanboardColumnId === task.columnId);
      if (column) {
        column.tasks.push(task);
      } else {
        // Fallback: use status logic if columnId doesn't match
        const status = this.getTaskStatus(task);
        const fallbackColumn = this.columns.find(col => col.id === status);
        if (fallbackColumn) {
          fallbackColumn.tasks.push(task);
        }
      }
    });

    // Sort tasks by position within each column
    this.columns.forEach(column => {
      column.tasks.sort((a, b) => a.order - b.order);
    });
  }

  getTaskStatus(task: Task): TaskStatus {
    // Primary: Use columnId mapping
    const column = this.columns.find(col => col.kanboardColumnId === task.columnId);
    if (column) {
      return column.id;
    }
    
    return 'new';
  }

  onTaskDrop(event: CdkDragDrop<Task[]>, targetColumn: TaskColumn) {
    const task = event.previousContainer.data[event.previousIndex];
    const sourceColumn = this.columns.find(col => col.tasks === event.previousContainer.data);

    if (event.previousContainer === event.container) {
      // Same column - just reorder
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      
      // Update positions for all tasks in this column
      this.updateTaskPositions(targetColumn);
    } else {
      // Different column - move task
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      // Move task in Kanboard
      this.moveTaskToColumn(task, targetColumn, event.currentIndex);
    }
  }

  moveTaskToColumn(task: Task, targetColumn: TaskColumn, order: number) {
    if (!this.selectedProjectId) return;

    const moveRequest = {
      projectId: this.selectedProjectId,
      columnId: targetColumn.kanboardColumnId,
      order: order + 1, // Kanboard positions are 1-based
    };

    this.api.moveTask(task.id, moveRequest).subscribe({
      next: () => {
        // Update local task object
        task.columnId = targetColumn.kanboardColumnId;
        task.order = order;

        // Update positions for source and target columns
        this.updateTaskPositions(targetColumn);

        // Optionally update task metadata based on column
        this.updateTaskMetadataByColumn(task, targetColumn.id);
      },
      error: (error) => {
        console.error('Failed to move task:', error);
        // Refresh to restore correct state
        if (this.selectedProjectId) {
          this.loadTasks(this.selectedProjectId);
        }
      }
    });
  }

  updateTaskPositions(column: TaskColumn) {
    // Update position property for all tasks in column to match their array index
    column.tasks.forEach((task, index) => {
      task.order = index;
    });
  }

  updateTaskMetadataByColumn(task: Task, status: TaskStatus) {
    // Optionally update task metadata when moved to different status columns
    const updates: any = { };

    switch (status) {
      case 'new':
        updates.completedDate = undefined;
        break;
      case 'in-progress':
        updates.completedDate = undefined;
        break;
      case 'completed':
        updates.completedDate = Date.now() / 1000; // Unix timestamp
        break;
    }

    // Only update if there are changes
    if (Object.keys(updates).length > 0) {
      this.api.updateTask({ ...task, ...updates }).subscribe({
        next: () => {
          Object.assign(task, updates);
        },
        error: (error) => {
          console.error('Failed to update task metadata:', error);
        }
      });
    }
  }

  editTask(task: Task, event?: Event) {
    event?.stopPropagation();
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: '500px',
      data: { task }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.selectedProjectId) {
        this.loadTasks(this.selectedProjectId);
      }
    });
  }

  openTaskDetail(task: Task) {
    this.dialog.open(TaskDetailDialogComponent, {
      width: '700px',
      data: { task }
    });
  }

  deleteTask(task: Task, event?: Event) {
    event?.stopPropagation();

    if (!this.auth.isLoggedIn()) {
      alert('Log in to delete tasks.');
      return;
    }
    
    if (!confirm(`Delete "${task.title}"?`)) return;

    this.api.deleteTask(task.id).subscribe(() => {
      this.tasks = this.tasks.filter(t => t.id !== task.id);
      this.organizeTasksByStatus();
    });
  }

  openCreateTask() {
    if (!this.selectedProjectId) return;

    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: '500px',
      data: { task: { projectId: this.selectedProjectId } }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadTasks(this.selectedProjectId!);
      }
    });
  }

  cycleViewMode() {
    const modes: ViewMode[] = ['kanban', 'grid', 'list'];
    const currentIndex = modes.indexOf(this.viewMode);
    this.viewMode = modes[(currentIndex + 1) % modes.length];
  }

  getViewIcon(): string {
    switch (this.viewMode) {
      case 'kanban': return 'view_week';
      case 'grid': return 'view_module';
      case 'list': return 'view_list';
      default: return 'view_week';
    }
  }

  getViewTooltip(): string {
    switch (this.viewMode) {
      case 'kanban': return 'Switch to Grid view';
      case 'grid': return 'Switch to List view';
      case 'list': return 'Switch to Kanban view';
      default: return 'Change view';
    }
  }

  getPriorityColor(priority: number): string {
    if (priority >= 7) return 'high';
    if (priority >= 4) return 'medium';
    return 'low';
  }

  getPriorityLabel(priority: number): string {
    if (priority >= 7) return 'High';
    if (priority >= 4) return 'Medium';
    return 'Low';
  }

  getTaskStatusClass(task: Task): string {
    const status = this.getTaskStatus(task);
    return status;
  }

  getColumnTaskCount(columnId: TaskStatus): number {
    const column = this.columns.find(col => col.id === columnId);
    return column ? column.tasks.length : 0;
  }

  canDeleteTasks(): boolean {
    return this.auth.isLoggedIn();
  }
}
