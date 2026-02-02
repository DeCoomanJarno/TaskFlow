import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from '../../../core/services/api.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { User } from '../../../core/models/user.model';

export interface UserDialogData {
  user?: User;
}

@Component({
  selector: 'app-user-dialog',
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule
  ],
  templateUrl: './user-dialog.component.html',
  styleUrl: './user-dialog.component.less'
})
export class UserDialogComponent implements OnInit {
  userForm!: FormGroup;
  isEditMode: boolean = false;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    public dialogRef: MatDialogRef<UserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserDialogData
  ) { }

  ngOnInit() {
    this.isEditMode = !!this.data?.user?.id;

    this.userForm = this.fb.group({
      username: [this.data?.user?.username || '', [Validators.required, Validators.minLength(1)]],
      password: [this.data?.user?.password || '',]
    },
      {
        validators: this.passwordOrUsernameMinLengthValidator
      });
  }

  passwordOrUsernameMinLengthValidator(form: FormGroup) {
  const usernameCtrl = form.get('username');
  const passwordCtrl = form.get('password');

  const username = usernameCtrl?.value || '';
  const password = passwordCtrl?.value || '';
  passwordCtrl?.setErrors(null);

    // Case 1: password is provided → must be ≥ 6
  if (password) {
    if (password.length < 6) {
      passwordCtrl?.setErrors({ minlength: true });
      return { passwordTooShort: true };
    }
  } else {
    if (username.length < 6) {
      passwordCtrl?.setErrors({ usernameUsedAsPasswordTooShort: true });
      return { usernameUsedAsPasswordTooShort: true };
    }
  }

    return null;
  }

  save() {
    if (this.userForm.invalid) return;

    const formValue = this.userForm.value;

    if (!formValue.password)
      formValue.password = formValue.username;

    if (this.isEditMode) {
      this.api.updateUser(formValue).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err) => console.error('Failed to update user', err)
      });
    } else {
      this.api.addUser(formValue).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err) => console.error('Failed to create user', err)
      });
    }
  }

  close() {
    this.dialogRef.close();
  }
}