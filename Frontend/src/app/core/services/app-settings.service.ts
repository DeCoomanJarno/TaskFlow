import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AppSettings, DEFAULT_APP_SETTINGS } from '../models/app-settings.model';

const SETTINGS_STORAGE_KEY = 'taskflow-settings';

@Injectable({
  providedIn: 'root'
})
export class AppSettingsService {
  private readonly settingsSubject = new BehaviorSubject<AppSettings>(this.readStoredSettings());

  readonly settings$ = this.settingsSubject.asObservable();

  get settings(): AppSettings {
    return this.settingsSubject.value;
  }

  save(settings: AppSettings): void {
    const normalized = { ...DEFAULT_APP_SETTINGS, ...settings };
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(normalized));
    this.settingsSubject.next(normalized);
  }

  reset(): void {
    this.save(DEFAULT_APP_SETTINGS);
  }

  private readStoredSettings(): AppSettings {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);

    if (!stored) {
      return { ...DEFAULT_APP_SETTINGS };
    }

    try {
      return { ...DEFAULT_APP_SETTINGS, ...JSON.parse(stored) };
    } catch {
      return { ...DEFAULT_APP_SETTINGS };
    }
  }
}
