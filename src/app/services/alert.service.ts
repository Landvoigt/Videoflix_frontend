import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Alert } from '../interfaces/alert.interface';


@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private alertSubject = new BehaviorSubject<Alert | null>(null);

  constructor() {}

  getAlert(): Observable<Alert | null> {
    return this.alertSubject.asObservable();
  }

  showAlert(message: string, type: 'success' | 'error' | 'info' | 'warning') {
    this.alertSubject.next({ message, type });
    setTimeout(() => {
      this.alertSubject.next(null);
    }, 2750);
  }

  clearAlert() {
    this.alertSubject.next(null);
  }
}