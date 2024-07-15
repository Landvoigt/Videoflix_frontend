import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { NavigationService } from '../services/navigation.service';
import { Profile } from '../../models/profile.model';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly TOKEN_KEY = 'authToken';

  private currentProfile: Profile | null = null;
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: any, private navService: NavigationService) {

    //// we need this extra control because we are using this server-side rendering from angular
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

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
      this.navService.profiles();
      return false;
    }
    return true;
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
    const storageToken = localStorage.getItem('authToken');
    if (storageToken) {
      return `Token ${storageToken}`;
    }
    return null;
  }

  setProfile(profile: Profile): void {
    this.currentProfile = profile;
    if (this.isBrowser && typeof localStorage !== 'undefined') {
      localStorage.setItem('currentProfile', JSON.stringify(profile));
    }
  }

  getProfile(): Profile | null {
    if (this.currentProfile) {
      return this.currentProfile;
    }
    if (this.isBrowser && typeof localStorage !== 'undefined') {
      const profile = localStorage.getItem('currentProfile');
      if (profile) {
        this.currentProfile = JSON.parse(profile) as Profile;
        return this.currentProfile;
      }
    }
    return null;
  }
}