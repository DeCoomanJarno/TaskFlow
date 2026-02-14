import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';

export interface AppNotification {
  id: number;
  message: string;
  createdAt: string;
  read: boolean;
}

const NOTIFICATIONS_STORAGE_KEY = 'taskflow-notifications';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly notificationsSubject = new BehaviorSubject<AppNotification[]>(this.readStoredNotifications());

  readonly notifications$ = this.notificationsSubject.asObservable();
  readonly unreadCount$ = this.notifications$.pipe(map(items => items.filter(item => !item.read).length));

  notify(message: string): void {
    const item: AppNotification = {
      id: Date.now(),
      message,
      createdAt: new Date().toISOString(),
      read: false
    };

    const next = [item, ...this.notificationsSubject.value].slice(0, 20);
    this.update(next);
  }

  markAllRead(): void {
    const next = this.notificationsSubject.value.map(item => ({ ...item, read: true }));
    this.update(next);
  }

  clear(): void {
    this.update([]);
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
