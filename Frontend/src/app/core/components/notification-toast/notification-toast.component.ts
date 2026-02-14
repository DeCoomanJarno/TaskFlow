import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_SNACK_BAR_DATA, MatSnackBarModule, MatSnackBarRef } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';

export interface NotificationToastData {
  message: string;
  durationMs: number;
}

export type NotificationToastAction = 'timeout' | 'snooze' | 'remove';

@Component({
  selector: 'app-notification-toast',
  standalone: true,
  imports: [CommonModule, MatSnackBarModule, MatButtonModule],
  templateUrl: './notification-toast.component.html',
  styleUrl: './notification-toast.component.scss'
})
export class NotificationToastComponent implements OnInit, OnDestroy {
  secondsRemaining = 0;
  selectedAction: NotificationToastAction = 'timeout';

  private countdown?: ReturnType<typeof setInterval>;

  constructor(
    @Inject(MAT_SNACK_BAR_DATA) public data: NotificationToastData,
    private readonly snackBarRef: MatSnackBarRef<NotificationToastComponent>
  ) {}

  ngOnInit(): void {
    this.secondsRemaining = Math.ceil(this.data.durationMs / 1000);
    this.countdown = setInterval(() => {
      if (this.secondsRemaining > 0) {
        this.secondsRemaining -= 1;
      }
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.countdown) {
      clearInterval(this.countdown);
    }
  }

  snooze(): void {
    this.selectedAction = 'snooze';
    this.snackBarRef.dismiss();
  }

  remove(): void {
    this.selectedAction = 'remove';
    this.snackBarRef.dismiss();
  }
}
