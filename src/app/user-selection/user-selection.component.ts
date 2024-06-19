import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { fadeInPage } from '../utils/animations';
import { CommonModule } from '@angular/common';
import { DialogCreateProfileComponent } from '../dialog-create-profile/dialog-create-profile.component';
import { LoadingScreenComponent } from '../loading-screen/loading-screen.component';

@Component({
  selector: 'app-user-selection',
  standalone: true,
  imports: [CommonModule, DialogCreateProfileComponent, LoadingScreenComponent],
  templateUrl: './user-selection.component.html',
  styleUrl: './user-selection.component.scss',
  animations: [fadeInPage]
})
export class UserSelectionComponent {

  profiles: any[] = [
    {
      id: 1,
      name: "Hildegard",
      image: "/assets/img/profile-images/profile_3.png"
    }
  ];

  isDialogOpen: boolean = false;
  isEdit: boolean = false;
  currentProfileId: number | null = null;

  loadingApp: boolean = false;

  constructor(
    private router: Router) { }

  openCreateProfile() {
    this.isEdit = false;
    this.isDialogOpen = true;
  }

  startApp(index: number) {
    let profileId = this.profiles[index].id;
    //// find id in users.profiles take correct setup

    this.loadingApp = true;
    setTimeout(() => {
      this.loadingApp = false;
      this.router.navigate(['/mainpage']);
    }, 2500);

  }

  editProfile(index: number) {
    this.isEdit = true;
    this.currentProfileId = this.profiles[index].id;
    this.isDialogOpen = true;
  }

  createProfile(newProfile: any) {
    this.profiles.push(newProfile);
    this.isDialogOpen = false;
  }

  navigateBack() {
    this.router.navigate(['/login']);
  }
}