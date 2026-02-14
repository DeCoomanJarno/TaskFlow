import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { Subject, takeUntil } from 'rxjs';
import { AppSettings, DEFAULT_APP_SETTINGS } from '../../../core/models/app-settings.model';
import { AppSettingsService } from '../../../core/services/app-settings.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatFormFieldModule,
    MatSelectModule
  ],
  templateUrl: './settings-page.component.html',
  styleUrl: './settings-page.component.scss'
})
export class SettingsPageComponent implements OnInit, OnDestroy {
  settings: AppSettings = { ...DEFAULT_APP_SETTINGS };
  isSaved = false;
  hasUnsavedChanges = false;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly appSettings: AppSettingsService,
    private readonly notifications: NotificationService
  ) {}

  ngOnInit(): void {
    this.appSettings.settings$
      .pipe(takeUntil(this.destroy$))
      .subscribe(settings => {
        this.settings = { ...settings };
        this.hasUnsavedChanges = false;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  markChanged(): void {
    this.hasUnsavedChanges = true;
    this.isSaved = false;
  }

  saveSettings(): void {
    this.appSettings.save(this.settings);

    if (this.settings.notificationsEnabled) {
      this.notifications.notify('Settings were updated successfully.');
    }

    this.isSaved = true;
    this.hasUnsavedChanges = false;

    setTimeout(() => {
      this.isSaved = false;
    }, 2500);
  }

  resetSettings(): void {
    this.settings = { ...DEFAULT_APP_SETTINGS };
    this.markChanged();

    if (this.settings.notificationsEnabled) {
      this.notifications.notify('Defaults loaded. Save to apply them.');
    }
  }

  restoreSavedSettings(): void {
    this.settings = { ...this.appSettings.settings };
    this.hasUnsavedChanges = false;

    if (this.settings.notificationsEnabled) {
      this.notifications.notify('Unsaved changes were discarded.');
    }
  }
}
