import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ProjectListComponent } from './features/components/project-list/project-list.component';
import { TaskBoardComponent } from './features/components/task-board/task-board.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { UserManagementComponent } from './features/components/user-management/user-management.component';

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
    MatButtonModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.less'
})
export class AppComponent {
  title = 'task-manager-frontend';
  currentView: 'tasks' | 'users' = 'tasks';
  
  switchView(view: 'tasks' | 'users') {
    this.currentView = view;
  }
}
