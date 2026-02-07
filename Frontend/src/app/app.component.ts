import { Component } from '@angular/core';
import { ProjectListComponent } from './features/components/project-list/project-list.component';
import { TaskBoardComponent } from './features/components/task-board/task-board.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { UserManagementComponent } from './features/components/user-management/user-management.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AuthService } from './core/services/auth.service';
import { LoginDialogComponent } from './features/components/login-dialog/login-dialog.component';
import { Observable } from 'rxjs';
import { User } from './core/models/user.model';
import { AnalyticsPageComponent } from './features/components/analytics-page/analytics-page.component';
import { SettingsPageComponent } from './features/components/settings-page/settings-page.component';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    ProjectListComponent,
    TaskBoardComponent,
    UserManagementComponent,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    AnalyticsPageComponent,
    SettingsPageComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'task-manager-frontend';
  currentView: 'tasks' | 'users' | 'analytics' | 'settings' = 'tasks';
  currentUser$: Observable<User | null>;

  constructor(
    private dialog: MatDialog,
    private auth: AuthService
  ) {
    this.currentUser$ = this.auth.currentUser$;
  }
  
  switchView(view: 'tasks' | 'users' | 'analytics' | 'settings') {
    this.currentView = view;
  }

  openLogin() {
    this.dialog.open(LoginDialogComponent, {
      width: '400px'
    });
  }

  logout() {
    this.auth.logout();
  }
}
