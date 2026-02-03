import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { Comment } from '../../../core/models/comment.model';
import { Task } from '../../../core/models/task.model';

export interface TaskDetailDialogData {
  task: Task;
}

@Component({
  selector: 'app-task-detail-dialog',
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    ReactiveFormsModule
  ],
  templateUrl: './task-detail-dialog.component.html',
  styleUrl: './task-detail-dialog.component.less'
})
export class TaskDetailDialogComponent implements OnInit {
  commentForm!: FormGroup;
  comments: Comment[] = [];
  isLoggedIn = false;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private auth: AuthService,
    public dialogRef: MatDialogRef<TaskDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TaskDetailDialogData
  ) {}

  ngOnInit() {
    this.isLoggedIn = this.auth.isLoggedIn();
    this.commentForm = this.fb.group({
      text: ['', [Validators.required, Validators.maxLength(500)]]
    });
    this.refreshComments();
  }

  refreshComments() {
    this.api.getTaskComments(this.data.task.id).subscribe({
      next: (comments) => this.comments = comments,
      error: (err) => console.error('Failed to load comments', err)
    });
  }

  addComment() {
    if (!this.isLoggedIn || this.commentForm.invalid) {
      return;
    }

    const { text } = this.commentForm.value;
    this.api.addTaskComment(this.data.task.id, { text }).subscribe({
      next: (comment) => {
        this.comments = [...this.comments, comment];
        this.commentForm.reset();
      },
      error: (err) => console.error('Failed to add comment', err)
    });
  }

  deleteComment(comment: Comment) {
    if (!this.isLoggedIn) {
      return;
    }

    this.api.deleteTaskComment(this.data.task.id, comment.id).subscribe({
      next: () => {
        this.comments = this.comments.filter(item => item.id !== comment.id);
      },
      error: (err) => console.error('Failed to delete comment', err)
    });
  }
}
