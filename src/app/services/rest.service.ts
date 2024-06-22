import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, tap, throwError } from 'rxjs';
import { Profile } from '../user-selection/user-selection.component';

@Injectable({
  providedIn: 'root'
})
export class RestService {
  apiBaseUrl: string = 'http://127.0.0.1:8000/';

  private profilesSubject = new BehaviorSubject<Profile[]>([]);
  profiles$: Observable<Profile[]> = this.profilesSubject.asObservable();

  constructor(private http: HttpClient) { }

  register(email: string, password: string): Observable<any> {
    const payload = { email, password };
    console.log(payload);  ////// remove
    return this.http.post(`${this.apiBaseUrl}register/`, payload);
  }

  login(identifier: string, password: string): Observable<any> {
    const payload = { identifier, password };
    console.log(payload);  ////// remove
    return this.http.post(`${this.apiBaseUrl}login/`, payload);
  }

  sendMail(email: string): Observable<any> {
    const payload = { email };
    console.log(payload);  ////// remove
    return this.http.post(`${this.apiBaseUrl}api/password_reset/`, payload);
  }

  /////
  validateResetToken(token: string): Observable<any> {
    const payload = { token };
    console.log(payload);  ////// remove
    return this.http.post(`${this.apiBaseUrl}api/password_reset/validate/`, payload);
  }

  resetPassword(token: string, password: string): Observable<any> {
    const payload = { token, password };
    console.log(payload);  ////// remove
    return this.http.post(`${this.apiBaseUrl}api/password_reset/confirm/`, payload);
  }

  //// Authentication !!!! ToDo
  updateUsername(new_username: string): Observable<any> {
    const payload = { new_username };
    console.log(payload);  ////// remove
    return this.http.post(`${this.apiBaseUrl}api/update_username/`, payload);
  }



  private getHeaders(): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      headers = headers.set('Authorization', `Token ${authToken}`);
    }

    return headers;
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    if (error.status === 401) {
      console.error('Unauthorized access:', error);
    }
    return throwError(() => { });
  }

  getProfiles(): Observable<Profile[]> {
    return this.http.get<Profile[]>(`${this.apiBaseUrl}profiles/`, { headers: this.getHeaders() }).pipe(
      tap(profiles => this.profilesSubject.next(profiles)),
      catchError(this.handleError)
    );
  }

  addProfile(payload: any): Observable<any> {
    return this.http.post(`${this.apiBaseUrl}profiles/`, payload, { headers: this.getHeaders() }).pipe(
      tap(() => this.getProfiles().subscribe()),
      catchError(this.handleError)
    );
  }

  updateProfile(payload: any, id: number): Observable<any> {
    return this.http.patch(`${this.apiBaseUrl}profiles/${id}/`, payload, { headers: this.getHeaders() }).pipe(
      tap(() => this.getProfiles().subscribe()),
      catchError(this.handleError)
    );
  }

  deleteProfile(id: string): Observable<any> {
    return this.http.delete(`${this.apiBaseUrl}profiles/${id}/`, { headers: this.getHeaders() }).pipe(
      tap(() => this.getProfiles().subscribe()),
      catchError(this.handleError)
    );
  }
}