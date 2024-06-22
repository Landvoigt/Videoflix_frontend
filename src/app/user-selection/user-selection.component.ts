import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { fadeInPage } from '../utils/animations';
import { CommonModule } from '@angular/common';
import { DialogCreateProfileComponent } from '../dialog-create-profile/dialog-create-profile.component';
import { LoadingScreenComponent } from '../loading-screen/loading-screen.component';
import { RestService } from '../services/rest.service';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Profile {
  id: number;
  name: string;
  avatar_id: number;
  // Weitere Eigenschaften entsprechend deiner Datenstruktur
}
@Component({
  selector: 'app-user-selection',
  standalone: true,
  imports: [CommonModule, DialogCreateProfileComponent, LoadingScreenComponent],
  templateUrl: './user-selection.component.html',
  styleUrl: './user-selection.component.scss',
  animations: [fadeInPage]
})
export class UserSelectionComponent implements OnInit {

  profiles$: Observable<Profile[]>;

  profileImages: any[] = [
    "/assets/img/profile-images/profile_1.png",
    "/assets/img/profile-images/profile_2.png",
    "/assets/img/profile-images/profile_3.png",
    "/assets/img/profile-images/profile_4.png",
    "/assets/img/profile-images/profile_5.png",
    "/assets/img/profile-images/profile_6.png",
    "/assets/img/profile-images/profile_7.png",
  ];

  isDialogOpen: boolean = false;
  isEdit: boolean = false;
  currentProfileId: number | null = null;

  loadingApp: boolean = false;
  loading: boolean = false;

  constructor(
    private router: Router,
    private restService: RestService,) {

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

  addProfile(payload: any): void {
    this.loading = true;
    this.restService.addProfile(payload).subscribe({
      error: (error) => {
        console.error('Error adding profile:', error);
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  updateProfile(payload: any, id: number): void {
    this.loading = true;
    this.restService.updateProfile(payload, id).subscribe({
      error: (error) => {
        console.error(`Error updating profile ${id}:`, error);
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  deleteProfile(id: string): void {
    this.loading = true;
    this.restService.deleteProfile(id).subscribe({
      error: (error) => {
        console.error(`Error deleting profile ${id}:`, error);
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  openCreateProfile() {
    this.isEdit = false;
    this.isDialogOpen = true;
  }

  startApp(index: number) {
    // let profileId = this.profiles[index].id;
    //// find id in users.profiles take correct setup

    this.loadingApp = true;
    setTimeout(() => {
      this.loadingApp = false;
      this.router.navigate(['/mainpage']);
    }, 2500);

  }

  editProfile(updatedProfile: any, id: number) {
    this.isEdit = true;


    ///// await undso
    this.updateProfile(updatedProfile, id)
    // this.currentProfileId = this.profiles[index].id;
    this.isDialogOpen = true;
  }

  createProfile(newProfile: any) {

    ///// await undso
    this.addProfile(newProfile);
    this.isDialogOpen = false;
  }

  navigateBack() {
    this.router.navigate(['/login']);
  }
}