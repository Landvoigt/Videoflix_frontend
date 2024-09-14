import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable, switchMap, tap } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { Profile } from '../../models/profile.model';
import { RestService } from './rest.service';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private readonly PROFILE_ID_KEY = 'currentProfileId';

  profilesSubject = new BehaviorSubject<Profile[]>([]);
  profiles$: Observable<Profile[]> = this.profilesSubject.asObservable();

  currentProfileSubject = new BehaviorSubject<Profile | null>(null);
  currentProfile$: Observable<Profile | null> = this.currentProfileSubject.asObservable();

  private isBrowser: boolean;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private restService: RestService
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    if (this.isBrowser) {
      const profileId = this.getProfileIdFromLocalStorage();
      if (profileId) {
        this.loadProfilesAndSetCurrent(profileId);
      }
    }
  }

  loadProfilesAndSetCurrent(profileId: number): void {
    this.restService.getProfiles().subscribe(profiles => {
      this.profilesSubject.next(profiles);
      const currentProfile = profiles.find(profile => profile.id === profileId);
      this.currentProfileSubject.next(currentProfile || null);
    });
  }

  setProfile(profile: Profile): void {
    this.currentProfileSubject.next(profile);
    if (this.isBrowser && typeof localStorage !== 'undefined') {
      localStorage.setItem(this.PROFILE_ID_KEY, profile.id.toString());
    }
  }

  updateProfile(id: number, payload: any): Observable<Profile> {
    return this.restService.updateProfile(id, payload).pipe(
      switchMap(() => this.restService.getProfiles()),
      tap((profiles: Profile[]) => {
        this.profilesSubject.next(profiles);
        const updatedProfile = profiles.find(profile => profile.id === id);
        this.currentProfileSubject.next(updatedProfile || null);
      }),
      switchMap(() => this.restService.getProfile(id))
    );
  }

  addProfile(profile: Profile): void {
    this.restService.addProfile(profile).pipe(
      switchMap(() => this.restService.getProfiles()),
      tap((profiles: Profile[]) => {
        this.profilesSubject.next(profiles);
      })
    ).subscribe();
  }

  deleteProfile(id: number): void {
    this.restService.deleteProfile(id).pipe(
      switchMap(() => this.restService.getProfiles()),
      tap((profiles: Profile[]) => {
        this.profilesSubject.next(profiles);
        if (this.currentProfileSubject.value?.id === id) {
          this.currentProfileSubject.next(null);
        }
      })
    ).subscribe();
  }

  private getProfileIdFromLocalStorage(): number | null {
    if (this.isBrowser && typeof localStorage !== 'undefined') {
      const profileId = localStorage.getItem(this.PROFILE_ID_KEY);
      return profileId ? parseInt(profileId, 10) : null;
    }
    return null;
  }

  clearProfile(): void {
    this.currentProfileSubject.next(null);
    if (this.isBrowser && typeof localStorage !== 'undefined') {
      localStorage.removeItem(this.PROFILE_ID_KEY);
    }
  }
}