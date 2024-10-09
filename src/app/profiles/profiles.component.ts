import { Component, OnDestroy, OnInit } from '@angular/core';
import { fadeIn } from '@utils/animations';
import { CommonModule } from '@angular/common';
import { DialogCreateProfileComponent } from '../dialog-create-profile/dialog-create-profile.component';
import { Subscription } from 'rxjs';
import { Profile, ProfileImages } from '../../models/profile.model';
import { NavigationService } from '@services/navigation.service';
import { AlertService } from '@services/alert.service';
import { ProfileService } from '@services/profile.service';
import { VideoService } from '@services/video.service';
import { LoadingScreenComponent } from '../loading-screen/loading-screen.component';

@Component({
  selector: 'app-profiles',
  standalone: true,
  imports: [CommonModule, DialogCreateProfileComponent, LoadingScreenComponent],
  templateUrl: './profiles.component.html',
  styleUrl: './profiles.component.scss',
  animations: [fadeIn]
})
export class ProfilesComponent implements OnInit, OnDestroy {
  profiles: Profile[];
  profileImages: string[] = ProfileImages;

  isDialogOpen: boolean = false;
  isEdit: boolean = false;
  currentProfileId: number | null = null;

  loading: boolean = false;
  hoveredIndex: number | null = null;

  private subscriptions: Subscription = new Subscription();

  constructor(
    public navService: NavigationService,
    public videoService: VideoService,
    private profileService: ProfileService,
    private alertService: AlertService) { }

  ngOnInit(): void {
    this.addProfilesListener();
    this.addCurrentProfileListener();
    this.profileService.loadProfilesAndSetCurrent(this.currentProfileId!);
  }

  addProfilesListener() {
    this.subscriptions.add(
      this.profileService.profiles$.subscribe((profiles: Profile[]) => {
        this.profiles = profiles;
      })
    );
  }

  addCurrentProfileListener() {
    this.subscriptions.add(
      this.profileService.currentProfile$.subscribe((profile: Profile) => {
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
    this.profileService.loadProfilesAndSetCurrent(this.currentProfileId!);
    this.isEdit = false;
    this.isDialogOpen = false;
  }

  startApp(profileId: number) {
    this.videoService.setAppLoading(true);
    this.profileService.updateProfile(profileId, { active: true })
      .subscribe((profile: Profile) => {
        if (profile) {
          this.profileService.setProfile(profile);
          this.profileService.profileSelected = true;
          this.videoService.fetchVideoData(true);
          this.navService.main();
        } else {
          this.videoService.setAppLoading(false);
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