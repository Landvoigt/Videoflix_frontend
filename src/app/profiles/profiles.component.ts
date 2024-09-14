import { Component, OnDestroy, OnInit } from '@angular/core';
import { fadeIn } from '@utils/animations';
import { CommonModule } from '@angular/common';
import { DialogCreateProfileComponent } from '../dialog-create-profile/dialog-create-profile.component';
import { RestService } from '@services/rest.service';
import { catchError, of, Subscription, switchMap } from 'rxjs';
import { Profile, ProfileImages } from '../../models/profile.model';
import { NavigationService } from '@services/navigation.service';
import { AlertService } from '@services/alert.service';
import { ProfileService } from '@services/profile.service';

@Component({
  selector: 'app-profiles',
  standalone: true,
  imports: [CommonModule, DialogCreateProfileComponent],
  templateUrl: './profiles.component.html',
  styleUrl: './profiles.component.scss',
  animations: [fadeIn]
})
export class ProfilesComponent implements OnInit, OnDestroy {
  profiles: Profile[];
  profileImages: any[] = ProfileImages;

  isDialogOpen: boolean = false;
  isEdit: boolean = false;
  currentProfileId: number | null = null;

  loading: boolean = false;
  hoveredIndex: number | null = null;

  private subscriptions: Subscription = new Subscription();

  constructor(
    public navService: NavigationService,
    private restService: RestService,
    private profileService: ProfileService,
    private alertService: AlertService) { }

  ngOnInit(): void {
    this.addProfileListeners();
    this.profileService.loadProfilesAndSetCurrent(this.currentProfileId!);
  }

  addProfileListeners() {
    this.subscriptions.add(
      this.profileService.profiles$.subscribe(profiles => {
        this.profiles = profiles;
      })
    );

    this.subscriptions.add(
      this.profileService.currentProfile$.subscribe(profile => {
        this.currentProfileId = profile ? profile.id : null;
      })
    );
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
    this.profileService.updateProfile(profileId, { active: true })
      .subscribe(profile => {
        if (profile) {
          this.profileService.setProfile(profile);
          this.navService.main();
        } else {
          this.alertService.showAlert('Profile could not be loaded', 'error');
        }
      });
  }

  getProfileImage(avatarId: number) {
    return this.profileImages[avatarId];
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}