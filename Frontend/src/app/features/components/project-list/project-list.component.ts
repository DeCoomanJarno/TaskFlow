import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { Project } from '../../../core/models/project.model';
import { Category } from '../../../core/models/category.model';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { ProjectDialogComponent } from '../project-dialog/project-dialog.component';
import { CategoryDialogComponent } from '../category-dialog/category-dialog.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
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
    MatAutocompleteModule,
    FormsModule
  ],
  templateUrl: './project-list.component.html',
  styleUrl: './project-list.component.less'
})
export class ProjectListComponent implements OnInit, OnDestroy {
  projects: Project[] = [];
  categories: Category[] = [];
  selectedCategory?: Category;
  selectedProjectId: number | null = null;
  searchText = '';
  private refreshSubscription?: Subscription;
  @Output() categorySelected = new EventEmitter<Category | undefined>();
 
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
      this.loadCategories();
    });
  }

  loadCategories(): void {
    const projectId = this.selectedProjectId ?? undefined;
    this.api.getCategories(projectId).subscribe(categories => {
      this.categories = categories;
      this.ensureSelectionVisible();
    });
  }

  get filteredProjects(): Project[] {
    const search = this.searchText.trim().toLowerCase();
    const filtered = search
      ? this.projects.filter(project => project.name.toLowerCase().includes(search))
      : this.projects;
    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }

  get filteredCategories(): Category[] {
    const search = this.searchText.trim().toLowerCase();
    let categories = [...this.categories];

    if (search) {
      categories = categories.filter(category => {
        const name = category.name?.toLowerCase() ?? '';
        const description = category.description?.toLowerCase() ?? '';
        return name.includes(search) || description.includes(search);
      });
    }

    return categories.sort((a, b) => a.name.localeCompare(b.name));
  }

  get selectedProjectName(): string | null {
    if (this.selectedProjectId == null) return null;
    return this.projects.find(project => project.id === this.selectedProjectId)?.name ?? null;
  }

  clearSearch(): void {
    this.searchText = '';
  }

  onProjectOptionSelected(event: MatAutocompleteSelectedEvent): void {
    const selectedValue = (event.option.value ?? '').toString().trim();
    if (!selectedValue) {
      this.clearProjectSelection();
      return;
    }

    const matchedProject = this.projects.find(project => project.name === selectedValue);
    if (matchedProject) {
      this.selectProject(matchedProject);
    }
  }

  selectProject(project: Project): void {
    this.selectedProjectId = project.id ?? null;
    this.searchText = '';
    this.loadCategories();
  }

  clearProjectSelection(): void {
    this.selectedProjectId = null;
    this.loadCategories();
  }

  ensureSelectionVisible(): void {
    if (!this.selectedCategory) return;

    const isVisible = this.filteredCategories.some(category => category.id === this.selectedCategory?.id);
    if (!isVisible) {
      this.selectedCategory = undefined;
      this.categorySelected.emit(undefined);
    }
  }

  selectCategory(category: Category): void {
    if (!category.isActive) return;
    this.selectedCategory = category;
    this.categorySelected.emit(category);
  }

  isSelected(category: Category): boolean {
    return this.selectedCategory?.id === category.id;
  }

  openCreateProjectDialog(): void {
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

  openCreateCategoryDialog(): void {
    const dialogRef = this.dialog.open(CategoryDialogComponent, {
      width: '600px',
      data: {
        projects: this.projects,
        defaultProjectId: this.selectedProjectId ?? (this.projects.length === 1 ? this.projects[0].id : null)
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.createCategory(result);
      }
    });
  }

  openEditCategoryDialog(category: Category, event: Event): void {
    event.stopPropagation();

    const dialogRef = this.dialog.open(CategoryDialogComponent, {
      width: '600px',
      data: {
        category,
        projects: this.projects
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.updateCategory(result);
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

  createCategory(category: Category): void {
    this.api.createCategory(category).subscribe({
      next: (response) => {
        console.log('Category created:', response);
        this.loadCategories();
      },
      error: (error) => {
        console.error('Error creating category:', error);
        alert('Failed to create category. Please try again.');
      }
    });
  }

  updateCategory(category: Category): void {
    if (!category.id) return;

    this.api.updateCategory(category.id, category).subscribe({
      next: () => {
        console.log('Category updated');
        this.loadCategories();
      },
      error: (error) => {
        console.error('Error updating category:', error);
        alert('Failed to update category. Please try again.');
      }
    });
  }

  deleteCategory(category: Category, event: Event): void {
    event.stopPropagation();

    if (!category.id) return;

    const confirmed = confirm(`Are you sure you want to delete "${category.name}"? This action cannot be undone.`);

    if (confirmed) {
      this.api.deleteCategory(category.id).subscribe({
        next: () => {
          console.log('Category deleted');

          if (this.selectedCategory?.id === category.id) {
            this.selectedCategory = undefined;
            this.categorySelected.emit(undefined);
          }

          this.loadCategories();
        },
        error: (error) => {
          console.error('Error deleting category:', error);
          alert('Failed to delete category. Please try again.');
        }
      });
    }
  }

  toggleActive(category: Category, event: Event): void {
    event.stopPropagation();

    if (!category.id) return;

    const updatedCategory = { ...category, isActive: !category.isActive };

    this.api.updateCategory(category.id, updatedCategory).subscribe({
      next: () => {
        category.isActive = !category.isActive;

        if (!category.isActive && this.selectedCategory?.id === category.id) {
          this.selectedCategory = undefined;
          this.categorySelected.emit(undefined);
        }
      },
      error: (error) => {
        console.error('Error toggling category status:', error);
        alert('Failed to update category status. Please try again.');
      }
    });
  }
}
