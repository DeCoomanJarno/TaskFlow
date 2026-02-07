import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

interface AppSettings {
  notificationsEnabled: boolean;
  compactMode: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  notificationsEnabled: true,
  compactMode: false
};

@Component({
  selector: 'app-settings-page',
  imports: [CommonModule, FormsModule, MatButtonModule, MatIconModule, MatSlideToggleModule],
  templateUrl: './settings-page.component.html',
  styleUrl: './settings-page.component.less'
})
export class SettingsPageComponent implements OnInit {
  settings: AppSettings = { ...DEFAULT_SETTINGS };
  isSaved = false;

  ngOnInit(): void {
    const stored = localStorage.getItem('taskflow-settings');
    if (stored) {
      try {
        this.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      } catch {
        this.settings = { ...DEFAULT_SETTINGS };
      }
    }
  }

  saveSettings(): void {
    localStorage.setItem('taskflow-settings', JSON.stringify(this.settings));
    this.isSaved = true;
    setTimeout(() => {
      this.isSaved = false;
    }, 2000);
  }

  resetSettings(): void {
    this.settings = { ...DEFAULT_SETTINGS };
    this.saveSettings();
  }
}
