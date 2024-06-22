import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { fadeInPage } from '../utils/animations';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dialog-create-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dialog-create-profile.component.html',
  styleUrl: './dialog-create-profile.component.scss',
  animations: [fadeInPage]
})
export class DialogCreateProfileComponent implements OnInit {
  @Input() isEdit: boolean = false;
  @Input() currentProfileId: number | null = null;

  @Output() createProfile = new EventEmitter<any>();
  @Output() closeDialog = new EventEmitter<any>();

  profileImages: any[] = [
    "/assets/img/profile-images/profile_1.png",
    "/assets/img/profile-images/profile_2.png",
    "/assets/img/profile-images/profile_3.png",
    "/assets/img/profile-images/profile_4.png",
    "/assets/img/profile-images/profile_5.png",
    "/assets/img/profile-images/profile_6.png",
    "/assets/img/profile-images/profile_7.png",
  ];

  selectedImage: string | null = null;
  selectedImageIndex: number | null = null;
  profileName: string = '';

  ngOnInit(): void {
    if (this.isEdit) {
      ///// get profiles from user take profileId and find pic url, set selectedImage and selectedImageIndex
    }
  }

  selectImage(index: number) {
    if (index === this.selectedImageIndex) {
      this.selectedImage = null;
      this.selectedImageIndex = null;
    } else {
      this.selectedImage = this.profileImages[index];
      this.selectedImageIndex = index;
    }
  }

  create() {
    this.createProfile.emit(
      {
        name: this.profileName,
        avatar_id: this.selectedImageIndex
      }
    );
  }

  close() {
    this.closeDialog.emit(null);
  }
}