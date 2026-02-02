import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Project } from '../../../core/models/project.model';

@Component({
  selector: 'app-project-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSlideToggleModule
  ],
  templateUrl: './project-dialog.component.html',
  styleUrl: './project-dialog.component.less'
})
export class ProjectDialogComponent {
projectForm: FormGroup;
  isEditMode: boolean;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ProjectDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { project?: Project }
  ) {
    this.isEditMode = !!data?.project?.id;
    this.projectForm = this.createForm(data?.project);
  }

  createForm(project?: Project): FormGroup {
    return this.fb.group({
      name: [project?.name || '', Validators.required],
      description: [project?.description || ''],
      identifier: [project?.identifier || ''],
      email: [project?.email || '', Validators.email],
      start_date: [project?.start_date || null],
      end_date: [project?.end_date || null],
      priority_default: [project?.priority_default || 0],
      priority_start: [project?.priority_start || 0],
      priority_end: [project?.priority_end || 10],
      is_active: [project?.is_active !== 0]
    });
  }

  onSave(): void {
    if (this.projectForm.valid) {
      const formValue = this.projectForm.value;
      const project: Project = {
        ...formValue,
        is_active: formValue.is_active ? 1 : 0,
        id: this.data?.project?.id
      };
      this.dialogRef.close(project);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
