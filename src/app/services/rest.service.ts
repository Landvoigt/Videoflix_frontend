import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { Profile } from '../../models/profile.model';
import { AuthService } from '../auth/auth.service';
import { ErrorService } from './error.service';

@Injectable({
  providedIn: 'root'
})
export class RestService {
  apiBaseUrl: string = 'http://127.0.0.1:8000/api/';

  constructor(
    private http: HttpClient, 
    private authService: AuthService, 
    private errorService: ErrorService) { }

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
    return this.http.post(`${this.apiBaseUrl}password_reset/`, payload);
  }

  validateResetToken(token: string): Observable<any> {
    const payload = { token };
    return this.http.post(`${this.apiBaseUrl}password_reset/validate/`, payload);
  }

  resetPassword(token: string, password: string): Observable<any> {
    const payload = { token, password };
    return this.http.post(`${this.apiBaseUrl}password_reset/confirm/`, payload);
  }

  updateUsername(new_username: string) {
    const payload = { new_username };
    return this.http.post(`${this.apiBaseUrl}update_username/`, payload, { headers: this.getHeaders() }).pipe(
      catchError(this.errorService.handleApiError)
    );
  }

  getProfiles(): Observable<Profile[]> {
    return this.http.get<Profile[]>(`${this.apiBaseUrl}profiles/`, { headers: this.getHeaders() }).pipe(
      catchError(this.errorService.handleApiError)
    );
  }

  getProfile(id: number): Observable<Profile> {
    return this.http.get<Profile>(`${this.apiBaseUrl}profiles/${id}`, { headers: this.getHeaders() }).pipe(
      catchError(this.errorService.handleApiError)
    );
  }

  addProfile(payload: any): Observable<any> {
    return this.http.post(`${this.apiBaseUrl}profiles/`, payload, { headers: this.getHeaders() }).pipe(
      catchError(this.errorService.handleApiError)
    );
  }

  updateProfile(id: number, payload: any): Observable<Profile> {
    return this.http.patch<Profile>(`${this.apiBaseUrl}profiles/${id}/`, payload, { headers: this.getHeaders() }).pipe(
      catchError(this.errorService.handleApiError)
    );
  }

  deleteProfile(id: number): Observable<any> {
    return this.http.delete(`${this.apiBaseUrl}profiles/${id}/`, { headers: this.getHeaders() }).pipe(
      catchError(this.errorService.handleApiError)
    );
  }

  contact(firstName: string, lastName: string, company: string, email: string, message: string): Observable<any> {
    const payload = { firstName, lastName, company, email, message };
    return this.http.post(`${this.apiBaseUrl}/contact/`, payload);
  }

  getHeaders(): HttpHeaders {
    const authToken = this.authService.getAuthenticationToken();
    let headers: { [key: string]: string } = {
      'Content-Type': 'application/json'
    };

    if (authToken) {
      headers['Authorization'] = authToken;
    }

    return new HttpHeaders(headers);
  }
}