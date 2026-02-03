import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-login-dialog',
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './login-dialog.component.html',
  styleUrl: './login-dialog.component.less'
})
export class LoginDialogComponent {
  users: User[] = [];
  selectedUserId?: number;

  constructor(
    private api: ApiService,
    private auth: AuthService,
    public dialogRef: MatDialogRef<LoginDialogComponent>
  ) {
    this.api.getUsers().subscribe(users => {
      this.users = users;
    });
  }

  login() {
    if (!this.selectedUserId) {
      return;
    }

    this.api.login(this.selectedUserId).subscribe({
      next: (user) => {
        this.auth.login(user);
        this.dialogRef.close(true);
      },
      error: (err) => console.error('Login failed', err)
    });
  }
}
