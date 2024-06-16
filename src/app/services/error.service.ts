import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AlertService } from './alert.service';

@Injectable({
  providedIn: 'root'
})
export class ErrorService {

  constructor(private alertService: AlertService) { }

  handleLoginError(error: HttpErrorResponse): void {
    if (error.status === 400 && error.error.error === 'Please provide email or username and password') {
      this.alertService.showAlert('Please provide email or username and password.', 'error');
    } else if (error.status === 400 && error.error.error === 'Invalid email') {
      this.alertService.showAlert('Invalid email!', 'error');
    } else if (error.status === 400 && error.error.error === 'Invalid username') {
      this.alertService.showAlert('Invalid username!', 'error');
    } else if (error.status === 401 && error.error.error === 'Invalid password') {
      this.alertService.showAlert('Invalid password!', 'error');
    } else {
      this.alertService.showAlert('An unexpected error occurred. Please try again later.', 'error');
    }
  }

  handleRegisterError(error: HttpErrorResponse): void {
    if (error.status === 400) {
      this.alertService.showAlert('Email and password are required.', 'error');
    } else if (error.status === 409) {
      this.alertService.showAlert('This user already exists.', 'error');
    } else if (error.status === 500) {
      this.alertService.showAlert('Error creating user. Please try again later.', 'error');
    } else {
      this.alertService.showAlert('An unexpected error occurred. Please try again later.', 'error');
    }
  }

  handleSendMailError(error: HttpErrorResponse): void {
    if (error.status === 400) {
      this.alertService.showAlert('No existing user with the given email.', 'error');
    } else {
      this.alertService.showAlert('An unexpected error occurred. Please try again later.', 'error');
    }
  }

  handleResetPasswordError(error: HttpErrorResponse): void {
    if (error.status === 400) {
      this.alertService.showAlert('No existing user with the given email.', 'error');
    } else {
      this.alertService.showAlert('An unexpected error occurred. Please try again later.', 'error');
    }
  }
}