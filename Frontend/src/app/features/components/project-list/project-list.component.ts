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
import { FormsModule } from '@angular/forms';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-project-list',
  standalone: true,
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
  styleUrl: './project-list.component.scss'
})
export class ProjectListComponent implements OnInit, OnDestroy {
  projects: Project[] = [];
  categories: Category[] = [];
  selectedCategory?: Category;
  selectedProjectId: number | null = null;
  searchText = '';

  private refreshSubscription?: Subscription;
  private projectOrder = new Map<number, number>();

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
      this.buildProjectOrder();
      this.loadCategories();
    });
  }

  loadCategories(): void {
    this.api.getCategories().subscribe(categories => {
      this.categories = categories;
      this.ensureSelectionVisible();
    });
  }

  private buildProjectOrder(): void {
    this.projectOrder.clear();
    this.projects.forEach((project, index) => {
      this.projectOrder.set(project.id!, index);
    });
  }

  get filteredCategories(): Category[] {
    const search = this.searchText.trim().toLowerCase();

    return this.categories
      .filter(category => {
        if (this.selectedProjectId != null && category.projectId !== this.selectedProjectId) {
          return false;
        }

        if (!search) return true;

        const name = category.name?.toLowerCase() ?? '';
        const description = category.description?.toLowerCase() ?? '';
        return name.includes(search) || description.includes(search);
      })
      .sort((a, b) => {
        if (this.selectedProjectId == null) {
          const pa = this.projectOrder.get(a.projectId) ?? 9999;
          const pb = this.projectOrder.get(b.projectId) ?? 9999;
          if (pa !== pb) return pa - pb;
        }

        return a.name.localeCompare(b.name);
      });
  }

  getProjectName(projectId: number): string {
    return this.projects.find(p => p.id === projectId)?.name ?? 'Unknown project';
  }

  get selectedProjectName(): string | null {
    if (this.selectedProjectId == null) return null;
    return this.projects.find(p => p.id === this.selectedProjectId)?.name ?? null;
  }

  get activeCount(): number {
    return this.filteredCategories.filter(cat => cat.isActive).length;
  }

  clearSearch(): void {
    this.searchText = '';
  }

  ensureSelectionVisible(): void {
    if (!this.selectedCategory) return;

    const visible = this.filteredCategories.some(c => c.id === this.selectedCategory?.id);
    if (!visible) {
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
    const dialogRef = this.dialog.open(ProjectDialogComponent, { width: '600px' });
    dialogRef.afterClosed().subscribe(result => result && this.createProject(result));
  }

  openCreateCategoryDialog(): void {
    const dialogRef = this.dialog.open(CategoryDialogComponent, {
      width: '600px',
      data: {
        projects: this.projects,
        defaultProjectId: this.selectedProjectId
      }
    });

    dialogRef.afterClosed().subscribe(result => result && this.createCategory(result));
  }

  openEditCategoryDialog(category: Category, event: Event): void {
    event.stopPropagation();

    const dialogRef = this.dialog.open(CategoryDialogComponent, {
      width: '600px',
      data: { category, projects: this.projects }
    });

    dialogRef.afterClosed().subscribe(result => result && this.updateCategory(result));
  }

  createProject(project: Project): void {
    this.api.createProject(project).subscribe(() => this.load());
  }

  createCategory(category: Category): void {
    this.api.createCategory(category).subscribe(() => this.loadCategories());
  }

  updateCategory(category: Category): void {
    if (!category.id) return;
    this.api.updateCategory(category.id, category).subscribe(() => this.loadCategories());
  }

  deleteCategory(category: Category, event: Event): void {
    event.stopPropagation();
    if (!category.id) return;

    if (confirm(`Delete "${category.name}"?`)) {
      this.api.deleteCategory(category.id).subscribe(() => this.loadCategories());
    }
  }

  toggleActive(category: Category, event: Event): void {
    event.stopPropagation();
    if (!category.id) return;

    const updated = { ...category, isActive: !category.isActive };
    this.api.updateCategory(category.id, updated).subscribe(() => {
      category.isActive = updated.isActive;
      this.ensureSelectionVisible();
    });
  }
}
