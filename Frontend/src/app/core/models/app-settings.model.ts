export type AppView = 'tasks' | 'users' | 'analytics';

export interface AppSettings {
  notificationsEnabled: boolean;
  compactMode: boolean;
  defaultView: AppView;
  emailDigest: 'never' | 'daily' | 'weekly';
  confirmBeforeLogout: boolean;
}

export const DEFAULT_APP_SETTINGS: AppSettings = {
  notificationsEnabled: true,
  compactMode: false,
  defaultView: 'tasks',
  emailDigest: 'daily',
  confirmBeforeLogout: true
};
