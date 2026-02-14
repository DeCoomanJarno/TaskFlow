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
import { AppSettingsService } from './core/services/app-settings.service';
import { AppSettings } from './core/models/app-settings.model';
import { AppNotification, NotificationService } from './core/services/notification.service';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';

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
    SettingsPageComponent,
    MatMenuModule,
    MatBadgeModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'task-manager-frontend';
  currentView: 'tasks' | 'users' | 'analytics' | 'settings' = 'tasks';
  currentUser$: Observable<User | null>;
  appSettings: AppSettings;
  notifications$: Observable<AppNotification[]>;
  unreadCount$: Observable<number>;

  constructor(
    private dialog: MatDialog,
    private auth: AuthService,
    private settingsService: AppSettingsService,
    private notificationsService: NotificationService
  ) {
    this.currentUser$ = this.auth.currentUser$;
    this.notifications$ = this.notificationsService.notifications$;
    this.unreadCount$ = this.notificationsService.unreadCount$;
    this.appSettings = this.settingsService.settings;
    this.currentView = this.appSettings.defaultView;

    this.settingsService.settings$.subscribe(settings => {
      this.appSettings = settings;

      if (!settings.notificationsEnabled) {
        this.notificationsService.markAllRead();
      }

      if (this.currentView !== 'settings') {
        this.currentView = settings.defaultView;
      }
    });
  }

  switchView(view: 'tasks' | 'users' | 'analytics' | 'settings') {
    this.currentView = view;

    if (view !== 'settings' && this.appSettings.notificationsEnabled) {
      this.notificationsService.notify(`Switched to ${view} view.`);
    }
  }

  openLogin() {
    this.dialog.open(LoginDialogComponent, {
      width: '400px'
    });

    if (this.appSettings.notificationsEnabled) {
      this.notificationsService.notify('Login dialog opened.');
    }
  }

  markNotificationsRead(): void {
    this.notificationsService.markAllRead();
  }

  clearNotifications(): void {
    this.notificationsService.clear();
  }

  removeNotification(notificationId: number): void {
    this.notificationsService.remove(notificationId);
  }

  logout() {
    if (this.appSettings.confirmBeforeLogout) {
      const shouldLogout = window.confirm('Log out of TaskFlow now?');

      if (!shouldLogout) {
        return;
      }
    }

    this.auth.logout();

    if (this.appSettings.notificationsEnabled) {
      this.notificationsService.notify('You have been logged out.');
    }
  }
}
