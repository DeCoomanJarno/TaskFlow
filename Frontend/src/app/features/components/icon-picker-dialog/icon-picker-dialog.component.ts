import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
export const MATERIAL_ICONS = [
  'category',
  'label',
  'folder',
  'bookmark',
  'sell',
  'work',
  'star',
  'bolt',
  'build',
  'layers',
  'event',
  'task',
  'schedule',
  'inventory'
];

@Component({
  selector: 'app-icon-picker-dialog',
  imports: [
    CommonModule,
    MatDialogModule,
    MatInputModule,
    MatIconModule,
    FormsModule
  ],
  templateUrl: './icon-picker-dialog.component.html',
  styleUrl: './icon-picker-dialog.component.scss'
})
export class IconPickerDialogComponent {
  search = '';

  icons = MATERIAL_ICONS;

  get filteredIcons(): string[] {
    const q = this.search.toLowerCase();
    return this.icons.filter(i => i.includes(q));
  }

  constructor(private dialogRef: MatDialogRef<IconPickerDialogComponent>) { }

  select(icon: string) {
    this.dialogRef.close(icon);
  }

}
