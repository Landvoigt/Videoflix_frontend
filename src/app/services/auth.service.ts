import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
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
}