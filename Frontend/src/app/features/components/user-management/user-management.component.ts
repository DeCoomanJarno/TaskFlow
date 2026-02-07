import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApiService } from '../../../core/services/api.service';
import { User } from '../../../core/models/user.model';
import { UserDialogComponent } from '../user-dialog/user-dialog.component';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-user-management',
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatCardModule,
    MatTooltipModule
  ],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss'
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  displayedColumns: string[] = ['id', 'username', 'actions'];

  constructor(
    private api: ApiService,
    private dialog: MatDialog,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.api.getUsers().subscribe(users => {
      this.users = users;
    });
  }

  openAddUser(): void {
    const dialogRef = this.dialog.open(UserDialogComponent, {
      width: '450px',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadUsers();
      }
    });
  }

  editUser(user: User): void {
    const dialogRef = this.dialog.open(UserDialogComponent, {
      width: '450px',
      data: { user }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadUsers();
      }
    });
  }

  deleteUser(user: User): void {
    if (!this.auth.isLoggedIn()) {
      alert('Log in to delete users.');
      return;
    }

    if (!confirm(`Delete user "${user.name}"?`)) return;
    
    // Note: You'll need to add a deleteUser method to your ApiService
    console.log('Delete user:', user);
     this.api.deleteUser(user.id).subscribe(() => {
       this.loadUsers();
     });
  }

  canDeleteUsers(): boolean {
    return this.auth.isLoggedIn();
  }
}
