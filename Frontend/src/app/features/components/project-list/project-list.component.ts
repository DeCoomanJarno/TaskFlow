import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { Project } from '../../../core/models/project.model';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { ProjectDialogComponent } from '../project-dialog/project-dialog.component';

@Component({
  selector: 'app-project-list',
  imports: [
    CommonModule, 
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatRippleModule,
    MatTooltipModule,
    MatMenuModule
  ],
  templateUrl: './project-list.component.html',
  styleUrl: './project-list.component.less'
})
export class ProjectListComponent implements OnInit {

  projects: Project[] = [];
  selectedProject?: Project;
  @Output() projectSelected = new EventEmitter<number>();
 
  constructor(
    private api: ApiService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.api.getProjects().subscribe(projects => {
      this.projects = projects;
    });
  }

  selectProject(project: Project): void {
    if (project.is_active === 0) return;
    this.selectedProject = project;
    this.projectSelected.emit(project.id);
  }

  isSelected(project: Project): boolean {
    return this.selectedProject?.id === project.id;
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(ProjectDialogComponent, {
      width: '600px',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.createProject(result);
      }
    });
  }

  openEditDialog(project: Project, event: Event): void {
    event.stopPropagation(); // Prevent selecting the project

    const dialogRef = this.dialog.open(ProjectDialogComponent, {
      width: '600px',
      data: { project }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.updateProject(result);
      }
    });
  }

  createProject(project: Project): void {
    this.api.createProject(project).subscribe({
      next: (response) => {
        console.log('Project created:', response);
        this.load(); // Reload the list
      },
      error: (error) => {
        console.error('Error creating project:', error);
        alert('Failed to create project. Please try again.');
      }
    });
  }

  updateProject(project: Project): void {
    if (!project.id) return;

    this.api.updateProject(project.id, project).subscribe({
      next: () => {
        console.log('Project updated');
        this.load(); // Reload the list
      },
      error: (error) => {
        console.error('Error updating project:', error);
        alert('Failed to update project. Please try again.');
      }
    });
  }

  deleteProject(project: Project, event: Event): void {
    event.stopPropagation(); // Prevent selecting the project

    if (!project.id) return;

    const confirmed = confirm(`Are you sure you want to delete "${project.name}"? This action cannot be undone.`);
    
    if (confirmed) {
      this.api.deleteProject(project.id).subscribe({
        next: () => {
          console.log('Project deleted');
          
          // If the deleted project was selected, clear selection
          if (this.selectedProject?.id === project.id) {
            this.selectedProject = undefined;
            this.projectSelected.emit(undefined as any);
          }
          
          this.load(); // Reload the list
        },
        error: (error) => {
          console.error('Error deleting project:', error);
          alert('Failed to delete project. Please try again.');
        }
      });
    }
  }

  toggleActive(project: Project, event: Event): void {
    event.stopPropagation(); // Prevent selecting the project

    if (!project.id) return;

    const call = project.is_active === 1
      ? this.api.disableProject(project.id)
      : this.api.enableProject(project.id);

    call.subscribe({
      next: () => {
        project.is_active = project.is_active === 1 ? 0 : 1;
        
        // If disabling the selected project, clear selection
        if (project.is_active === 0 && this.selectedProject?.id === project.id) {
          this.selectedProject = undefined;
          this.projectSelected.emit(undefined as any);
        }
      },
      error: (error) => {
        console.error('Error toggling project status:', error);
        alert('Failed to update project status. Please try again.');
      }
    });
  }
}