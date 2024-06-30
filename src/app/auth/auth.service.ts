import { Injectable } from '@angular/core';
import { NavigationService } from '../services/navigation.service';
import { Profile } from '../../models/profile.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly TOKEN_KEY = 'authToken';

  private currentProfile: Profile;

  constructor(private navService: NavigationService) { }

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

  isLoggedIn(): boolean {
    if (!this.isLocalStorageAvailable()) {
      return false;
    }
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  canActivate(): boolean {
    if (this.isLoggedIn()) {
      return true;
    } else {
      this.navService.login();
      return false;
    }
  }

  redirectIfLoggedIn(): boolean {
    if (this.isLoggedIn()) {
      this.navService.profile();
      return false;
    }
    return true;
  }

  login(token: string): void {
    if (this.isLocalStorageAvailable()) {
      localStorage.setItem(this.TOKEN_KEY, token);
    }
    this.navService.profile();
  }

  logout(): void {
    if (this.isLocalStorageAvailable()) {
      localStorage.removeItem(this.TOKEN_KEY);
    }
    this.navService.welcome();
  }

  getAuthenticationToken(): string | null {
    const storageToken = localStorage.getItem('authToken');
    if (storageToken) {
      return `Token ${storageToken}`;
    }
    return null;
  }

  setProfile(profile: Profile) {
    this.currentProfile = profile;
    localStorage.setItem('currentProfile', JSON.stringify(profile));
  }

  getProfile() {
    return this.currentProfile || JSON.parse(localStorage.getItem('currentProfile'));
  }
}