import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, tap, throwError } from 'rxjs';
import { Profile } from '../../models/profile.model';
import { AuthService } from '../auth/auth.service';
import { AlertService } from './alert.service';

@Injectable({
  providedIn: 'root'
})
export class RestService {
  apiBaseUrl: string = 'http://127.0.0.1:8000/';

  private profilesSubject = new BehaviorSubject<Profile[]>([]);
  profiles$: Observable<Profile[]> = this.profilesSubject.asObservable();

  constructor(private http: HttpClient, private authService: AuthService, private alertService: AlertService) { }

  register(email: string, password: string): Observable<any> {
    const payload = { email, password };
    return this.http.post(`${this.apiBaseUrl}register/`, payload);
  }

  login(identifier: string, password: string): Observable<any> {
    const payload = { identifier, password };
    return this.http.post(`${this.apiBaseUrl}login/`, payload);
  }

  sendMail(email: string): Observable<any> {
    const payload = { email };
    return this.http.post(`${this.apiBaseUrl}api/password_reset/`, payload);
  }

  validateResetToken(token: string): Observable<any> {
    const payload = { token };
    return this.http.post(`${this.apiBaseUrl}api/password_reset/validate/`, payload);
  }

  resetPassword(token: string, password: string): Observable<any> {
    const payload = { token, password };
    return this.http.post(`${this.apiBaseUrl}api/password_reset/confirm/`, payload);
  }

  updateUsername(new_username: string) {
    const payload = { new_username };
    return this.http.post(`${this.apiBaseUrl}api/update_username/`, payload, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  getProfiles(): Observable<Profile[]> {
    return this.http.get<Profile[]>(`${this.apiBaseUrl}profiles/`, { headers: this.getHeaders() }).pipe(
      tap(profiles => this.profilesSubject.next(profiles)),
      catchError(this.handleError)
    );
  }

  getProfile(id: number): Observable<Profile> {
    return this.http.get<Profile>(`${this.apiBaseUrl}profiles/${id}`, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  addProfile(payload: any): Observable<any> {
    return this.http.post(`${this.apiBaseUrl}profiles/`, payload, { headers: this.getHeaders() }).pipe(
      tap(() => this.getProfiles().subscribe()),
      catchError(this.handleError)
    );
  }

  updateProfile(id: number, payload: any): Observable<any> {
    return this.http.patch(`${this.apiBaseUrl}profiles/${id}/`, payload, { headers: this.getHeaders() }).pipe(
      tap(() => this.getProfiles().subscribe()),
      catchError(this.handleError)
    );
  }

  deleteProfile(id: number): Observable<any> {
    return this.http.delete(`${this.apiBaseUrl}profiles/${id}/`, { headers: this.getHeaders() }).pipe(
      tap(() => this.getProfiles().subscribe()),
      catchError(this.handleError)
    );
  }

  contact(firstName: string, lastName: string, company: string, email: string, message: string): Observable<any> {
    const payload = { firstName, lastName, company, email, message };
    return this.http.post(`${this.apiBaseUrl}/contact/`, payload);
  }

  private getHeaders(): HttpHeaders {
    const authToken = this.authService.getAuthenticationToken();
    let headers: { [key: string]: string } = {
      'Content-Type': 'application/json'
    };

    if (authToken) {
      headers['Authorization'] = authToken;
    }

    return new HttpHeaders(headers);
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    if (error.status === 401) {
      this.alertService.showAlert('Not authorized', 'error');
    }
    return throwError(() => { });
  }
}