import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';
import { MatIconModule } from '@angular/material/icon';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-analytics-page',
  imports: [CommonModule, MatIconModule],
  templateUrl: './analytics-page.component.html',
  styleUrl: './analytics-page.component.less'
})
export class AnalyticsPageComponent implements OnInit {
  isLoading = true;
  hasError = false;
  projectsCount = 0;
  categoriesCount = 0;
  activeCategoriesCount = 0;
  usersCount = 0;
  lastUpdated: Date | null = null;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    forkJoin({
      projects: this.api.getProjects(),
      categories: this.api.getCategories(),
      users: this.api.getUsers()
    }).subscribe({
      next: ({ projects, categories, users }) => {
        this.projectsCount = projects.length;
        this.categoriesCount = categories.length;
        this.activeCategoriesCount = categories.filter(category => category.isActive).length;
        this.usersCount = users.length;
        this.lastUpdated = new Date();
        this.isLoading = false;
      },
      error: () => {
        this.hasError = true;
        this.isLoading = false;
      }
    });
  }
}
