import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Category } from '../../../core/models/category.model';
import { Project } from '../../../core/models/project.model';

@Component({
  selector: 'app-category-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule
  ],
  templateUrl: './category-dialog.component.html',
  styleUrl: './category-dialog.component.less'
})
export class CategoryDialogComponent {
  categoryForm: FormGroup;
  isEditMode: boolean;
  projects: Project[];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CategoryDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { category?: Category; projects: Project[]; defaultProjectId?: number | null }
  ) {
    this.isEditMode = !!data?.category?.id;
    this.projects = data?.projects ?? [];
    this.categoryForm = this.createForm(data?.category);
  }

  createForm(category?: Category): FormGroup {
    return this.fb.group({
      name: [category?.name || '', Validators.required],
      description: [category?.description || ''],
      projectId: [category?.projectId ?? this.data?.defaultProjectId ?? null, Validators.required],
      isActive: [category?.isActive ?? true]
    });
  }

  onSave(): void {
    if (this.categoryForm.valid) {
      const formValue = this.categoryForm.value;
      const category: Category = {
        ...formValue,
        isActive: formValue.isActive ?? true,
        id: this.data?.category?.id
      };
      this.dialogRef.close(category);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
