import { Component } from '@angular/core';
import { AlertService } from '@services/alert.service';
import { CommonModule } from '@angular/common';
import { Alert } from '../interfaces/alert.interface';
import { fadeInAlert } from '@utils/animations';

@Component({
  selector: 'app-alert-box',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alert-box.component.html',
  styleUrl: './alert-box.component.scss',
  animations: [fadeInAlert]
})

export class AlertBoxComponent {
  message: string = '';
  type: 'success' | 'error' | 'info' | 'warning' = 'info';

  constructor(private alertService: AlertService) {}

  ngOnInit(): void {
    this.alertService.getAlert().subscribe((alert: Alert | null) => {
      if (alert) {
        this.message = alert.message;
        this.type = alert.type;
        setTimeout(() => {
          this.close();
        }, 2750);
      } else {
        this.message = '';
        this.type = 'info';
      }
    });
  }

  close() {
    this.message = '';
  }
}
