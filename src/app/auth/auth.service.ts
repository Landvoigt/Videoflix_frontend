import { Injectable } from '@angular/core';
import { NavigationService } from '@services/navigation.service';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'authToken';

  constructor(public navService: NavigationService) { }

  private isLocalStorageAvailable(): boolean {
    try {
      const testKey = '__test__';
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  }

  isLoggedIn(): Observable<boolean> {
    if (!this.isLocalStorageAvailable()) {
      return of(false);
    }
    const isLoggedIn = !!localStorage.getItem(this.TOKEN_KEY);
    return of(isLoggedIn);
  }

  canActivate(): Observable<boolean> {
    return this.isLoggedIn().pipe(
      map(isLoggedIn => {
        if (isLoggedIn) {
          return true;
        } else {
          this.navService.login();
          return false;
        }
      })
    );
  }

  redirectIfLoggedIn(): Observable<boolean> {
    return this.isLoggedIn().pipe(
      map(isLoggedIn => {
        if (isLoggedIn) {
          this.navService.profiles();
          return false;
        }
        return true;
      })
    );
  }

  login(token: string): void {
    if (this.isLocalStorageAvailable()) {
      localStorage.setItem(this.TOKEN_KEY, token);
    }
    this.navService.profiles();
  }

  logout(): void {
    if (this.isLocalStorageAvailable()) {
      localStorage.removeItem(this.TOKEN_KEY);
    }
    this.navService.welcome();
  }

  getAuthenticationToken(): string | null {
    const storageToken = localStorage.getItem(this.TOKEN_KEY);
    if (storageToken) {
      return `Token ${storageToken}`;
    }
    return null;
  }
}