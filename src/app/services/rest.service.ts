import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RestService {
  apiBaseUrl: string = 'http://127.0.0.1:8000/';

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
}