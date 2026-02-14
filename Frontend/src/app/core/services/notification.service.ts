import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AppSettingsService } from './app-settings.service';
import {
  NotificationToastAction,
  NotificationToastComponent,
  NotificationToastData
} from '../components/notification-toast/notification-toast.component';

export interface AppNotification {
  id: number;
  message: string;
  createdAt: string;
  read: boolean;
  snoozedUntil?: string;
}

const NOTIFICATIONS_STORAGE_KEY = 'taskflow-notifications';
const MAX_NOTIFICATIONS = 30;
const DEFAULT_TOAST_DURATION_MS = 6000;
const SNOOZE_DURATION_MS = 15000;

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly notificationsSubject = new BehaviorSubject<AppNotification[]>(this.readStoredNotifications());
  private activeNotificationId: number | null = null;

  readonly notifications$ = this.notificationsSubject.asObservable();
  readonly unreadCount$ = this.notifications$.pipe(map(items => items.filter(item => !item.read).length));

  constructor(
    private readonly snackBar: MatSnackBar,
    private readonly settingsService: AppSettingsService
  ) {
    this.settingsService.settings$.subscribe(() => {
      this.showNextToastIfNeeded();
    });
  }

  notify(message: string): void {
    const item: AppNotification = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      message,
      createdAt: new Date().toISOString(),
      read: false
    };

    const next = [item, ...this.notificationsSubject.value].slice(0, MAX_NOTIFICATIONS);
    this.update(next);
    this.showNextToastIfNeeded();
  }

  markAllRead(): void {
    const next = this.notificationsSubject.value.map(item => ({ ...item, read: true }));
    this.update(next);
  }

  clear(): void {
    this.activeNotificationId = null;
    this.snackBar.dismiss();
    this.update([]);
  }

  remove(id: number): void {
    const next = this.notificationsSubject.value.filter(item => item.id !== id);
    if (this.activeNotificationId === id) {
      this.activeNotificationId = null;
      this.snackBar.dismiss();
    }
    this.update(next);
    this.showNextToastIfNeeded();
  }

  private showNextToastIfNeeded(): void {
    if (!this.settingsService.settings.notificationsEnabled) {
      return;
    }

    if (this.activeNotificationId != null) {
      return;
    }

    const now = Date.now();
    const nextItem = [...this.notificationsSubject.value]
      .reverse()
      .find(item => !item.read && (!item.snoozedUntil || new Date(item.snoozedUntil).getTime() <= now));

    if (!nextItem) {
      return;
    }

    this.activeNotificationId = nextItem.id;
    const data: NotificationToastData = {
      message: nextItem.message,
      durationMs: DEFAULT_TOAST_DURATION_MS
    };

    const ref = this.snackBar.openFromComponent(NotificationToastComponent, {
      data,
      duration: DEFAULT_TOAST_DURATION_MS,
      horizontalPosition: 'right',
      verticalPosition: 'bottom',
      panelClass: ['taskflow-toast']
    });

    ref.afterDismissed().subscribe(() => {
      const action = ref.instance.selectedAction;
      this.handleToastClose(nextItem.id, action);
    });
  }

  private handleToastClose(notificationId: number, action: NotificationToastAction): void {
    const notifications = [...this.notificationsSubject.value];
    const index = notifications.findIndex(item => item.id === notificationId);

    if (index === -1) {
      this.activeNotificationId = null;
      this.showNextToastIfNeeded();
      return;
    }

    if (action === 'remove') {
      notifications.splice(index, 1);
    } else if (action === 'snooze') {
      notifications[index] = {
        ...notifications[index],
        snoozedUntil: new Date(Date.now() + SNOOZE_DURATION_MS).toISOString()
      };
    } else {
      notifications[index] = {
        ...notifications[index],
        read: true
      };
    }

    this.activeNotificationId = null;
    this.update(notifications);

    if (action === 'snooze') {
      setTimeout(() => this.showNextToastIfNeeded(), SNOOZE_DURATION_MS + 100);
    } else {
      this.showNextToastIfNeeded();
    }
  }

  private update(notifications: AppNotification[]): void {
    this.notificationsSubject.next(notifications);
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
  }

  private readStoredNotifications(): AppNotification[] {
    const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (!stored) {
      return [];
    }

    try {
      const parsed = JSON.parse(stored) as AppNotification[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
}
