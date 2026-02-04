import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
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
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-project-list',
  imports: [
    CommonModule, 
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatRippleModule,
    MatTooltipModule,
    MatMenuModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    FormsModule
  ],
  templateUrl: './project-list.component.html',
  styleUrl: './project-list.component.less'
})
export class ProjectListComponent implements OnInit, OnDestroy {

  projects: Project[] = [];
  selectedProject?: Project;
  selectedParentId: number | null = null;
  filterText = '';
  private refreshSubscription?: Subscription;
  @Output() projectSelected = new EventEmitter<number | undefined>();
 
  constructor(
    private api: ApiService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.load();
    this.refreshSubscription = interval(15000).subscribe(() => this.load());
  }

  ngOnDestroy(): void {
    this.refreshSubscription?.unsubscribe();
  }

  load(): void {
    this.api.getProjects().subscribe(projects => {
      this.projects = projects;
      this.ensureSelectionVisible();
    });
  }

  get hasHierarchy(): boolean {
    return this.projects.some(project => project.parentProjectId != null);
  }

  get parentProjects(): Project[] {
    return this.projects
      .filter(project => project.parentProjectId == null)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  get filteredCategories(): Project[] {
    const search = this.filterText.trim().toLowerCase();
    let categories = this.hasHierarchy
      ? this.projects.filter(project => project.parentProjectId != null)
      : this.projects;

    if (this.selectedParentId != null) {
      categories = categories.filter(project => project.parentProjectId === this.selectedParentId);
    }

    if (search) {
      categories = categories.filter(project => {
        const name = project.name?.toLowerCase() ?? '';
        const description = project.description?.toLowerCase() ?? '';
        return name.includes(search) || description.includes(search);
      });
    }

    return categories.sort((a, b) => a.name.localeCompare(b.name));
  }

  onParentChange(): void {
    this.ensureSelectionVisible();
  }

  ensureSelectionVisible(): void {
    if (!this.selectedProject) return;

    const isVisible = this.filteredCategories.some(project => project.id === this.selectedProject?.id);
    if (!isVisible) {
      this.selectedProject = undefined;
      this.projectSelected.emit(undefined);
    }
  }

  selectProject(project: Project): void {
    if (!project.isActive) return;
    this.selectedProject = project;
    this.projectSelected.emit(project.id);
  }

  isSelected(project: Project): boolean {
    return this.selectedProject?.id === project.id;
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(ProjectDialogComponent, {
      width: '600px',
      data: {
        parentOptions: this.parentProjects,
        defaultParentId: this.selectedParentId
      }
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
      data: {
        project,
        parentOptions: this.parentProjects.filter(parent => parent.id !== project.id)
      }
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
            this.projectSelected.emit(undefined);
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

    const call = project.isActive
      ? this.api.disableProject(project.id)
      : this.api.enableProject(project.id);

    call.subscribe({
      next: () => {
        project.isActive = !project.isActive;
        
        // If disabling the selected project, clear selection
        if (!project.isActive && this.selectedProject?.id === project.id) {
          this.selectedProject = undefined;
          this.projectSelected.emit(undefined);
        }
      },
      error: (error) => {
        console.error('Error toggling project status:', error);
        alert('Failed to update project status. Please try again.');
      }
    });
  }
}
