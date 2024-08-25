import { Component, OnInit } from '@angular/core';
import { fadeInPage } from '@utils/animations';
import { CommonModule } from '@angular/common';
import { DialogCreateProfileComponent } from '../dialog-create-profile/dialog-create-profile.component';
import { RestService } from '@services/rest.service';
import { Observable, catchError, of, switchMap } from 'rxjs';
import { Profile, ProfileImages } from '../../models/profile.model';
import { NavigationService } from '@services/navigation.service';
import { AlertService } from '@services/alert.service';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-profiles',
  standalone: true,
  imports: [CommonModule, DialogCreateProfileComponent],
  templateUrl: './profiles.component.html',
  styleUrl: './profiles.component.scss',
  animations: [fadeInPage]
})
export class ProfilesComponent implements OnInit {

  profiles$: Observable<Profile[]>;
  profileImages: any[] = ProfileImages;

  isDialogOpen: boolean = false;
  isEdit: boolean = false;
  currentProfileId: number | null = null;

  loading: boolean = false;
  hoveredIndex: number | null = null;

  constructor(
    public navService: NavigationService,
    private restService: RestService,
    private authService: AuthService,
    private alertService: AlertService) {

    this.profiles$ = this.restService.profiles$;
  }

  ngOnInit(): void {
    this.getProfiles();
  }

  getProfiles(): void {
    this.loading = true;
    this.restService.getProfiles().subscribe({
      error: (error) => {
        console.error('Error loading profiles:', error);
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  toggleEditBtn(index: number | null) {
    this.hoveredIndex = index;
  }

  openCreateProfile() {
    this.isEdit = false;
    this.isDialogOpen = true;
  }

  openEditProfile(event: MouseEvent, profileId: number): void {
    event.stopPropagation();
    this.currentProfileId = profileId;
    this.isEdit = true;
    this.isDialogOpen = true;
  }

  closeDialog() {
    this.isEdit = false;
    this.isDialogOpen = false;
  }

  startApp(profileId: number) {
    this.restService.updateProfile(profileId, { active: true }).pipe(
      switchMap(() => this.restService.getProfile(profileId)),
      catchError((error) => {
        this.alertService.showAlert('An unexpected error occured. Please try again!', 'error');
        return of(null);
      })
    ).subscribe(profile => {
      if (profile) {
        this.authService.setProfile(profile);
        this.navService.main();
      } else {
        this.alertService.showAlert('Profile could not be loaded', 'error');
      }
    });
  }

  getProfileImage(avatarId: number) {
    return this.profileImages[avatarId];
  }
}