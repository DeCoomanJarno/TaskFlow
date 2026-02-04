import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from '../../../core/services/api.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { User } from '../../../core/models/user.model';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { Task } from '../../../core/models/task.model';
import { Comment } from '../../../core/models/comment.model';

export interface TaskDialogData {
  task?: Task;
}

@Component({
  selector: 'app-task-dialog',
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSliderModule,
    ReactiveFormsModule
  ],
  templateUrl: './task-dialog.component.html',
  styleUrl: './task-dialog.component.less'
})
export class TaskDialogComponent implements OnInit {
   users: User[] = [];
  taskForm!: FormGroup;
  commentForm!: FormGroup;
  comments: Comment[] = [];
  isEditMode: boolean = false;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    public dialogRef: MatDialogRef<TaskDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TaskDialogData
  ) {}

  ngOnInit() {
    this.api.getUsers().subscribe(u => this.users = u);
    this.isEditMode = !!this.data?.task?.id;
    
    this.taskForm = this.fb.group({
      title: [this.data?.task?.title || '', Validators.required],
      description: [this.data?.task?.description || ''],
      assignedUserId: [this.data?.task?.assignedUserId || null],
      priority: [this.data?.task?.priority || 5],
      projectId: [this.data?.task?.projectId || -1],
      categoryId: [this.data?.task?.categoryId || null],
    });

    this.commentForm = this.fb.group({
      text: ['', [Validators.required, Validators.maxLength(500)]],
      userId: [null]
    });

    if (this.isEditMode && this.data?.task?.id) {
      this.comments = this.data.task?.comments ?? [];
      this.refreshComments(this.data.task.id);
    }
  }

  save() {
    if (this.taskForm.invalid) return;

    const formValue = this.taskForm.value;

    // Process tags
    if (formValue.tags && typeof formValue.tags === 'string') {
      formValue.tags = formValue.tags.split(',').map((t: string) => t.trim());
    }
    else
      formValue.tags = null;
    
    formValue.assignedUserId = this.users.find(user => user.id === formValue.assignedUserId)?.id ?? null;

    if (this.isEditMode) {
      const updates = { id: this.data.task?.id, ...formValue };
      this.api.updateTask(updates).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err) => console.error('Failed to update task', err)
      });
    } else {
      this.api.createTask(formValue).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err) => console.error('Failed to create task', err)
      });
    }
  }

  close() {
    this.dialogRef.close();
  }

  refreshComments(taskId: number) {
    this.api.getTaskComments(taskId).subscribe({
      next: (comments) => this.comments = comments,
      error: (err) => console.error('Failed to load comments', err)
    });
  }

  addComment() {
    if (!this.isEditMode || !this.data?.task?.id || this.commentForm.invalid) {
      return;
    }

    const { text, userId } = this.commentForm.value;
    this.api.addTaskComment(this.data.task.id, { text, userId }).subscribe({
      next: (comment) => {
        this.comments = [...this.comments, comment];
        this.commentForm.reset({ text: '', userId: null });
      },
      error: (err) => console.error('Failed to add comment', err)
    });
  }

  deleteComment(comment: Comment) {
    if (!this.isEditMode || !this.data?.task?.id) {
      return;
    }

    this.api.deleteTaskComment(this.data.task.id, comment.id).subscribe({
      next: () => {
        this.comments = this.comments.filter(item => item.id !== comment.id);
      },
      error: (err) => console.error('Failed to delete comment', err)
    });
  }

  getPriorityLabel(value: number): string {
    if (value >= 7) return 'High Priority';
    if (value >= 4) return 'Medium Priority';
    return 'Low Priority';
  }

  getPriorityColor(value: number): string {
    if (value >= 7) return 'high';
    if (value >= 4) return 'medium';
    return 'low';
  }
}
