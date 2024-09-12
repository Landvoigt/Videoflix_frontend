import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { fadeIn } from '@utils/animations';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Profile, ProfileImages } from '../../models/profile.model';
import { RestService } from '@services/rest.service';

@Component({
  selector: 'app-dialog-create-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dialog-create-profile.component.html',
  styleUrl: './dialog-create-profile.component.scss',
  animations: [fadeIn]
})
export class DialogCreateProfileComponent implements OnInit {
  @Input() isEdit: boolean = false;
  @Input() currentProfileId: number | null = null;

  @Output() closeDialog = new EventEmitter<any>();

  profile: Profile = new Profile('', 0);
  profileImages: any[] = ProfileImages;

  selectedImage: string | null = null;
  selectedImageIndex: number | null = null;
  profileName: string = '';
  loading: boolean = false;
  loadingBtn: string = 'add' || 'edit' || 'delete';

  constructor(private restService: RestService) { }

  ngOnInit(): void {
    if (this.isEdit && this.currentProfileId) {
      this.restService.getProfile(this.currentProfileId).subscribe({
        next: (data) => {
          this.profile = data;
          this.selectedImageIndex = this.profile.avatar_id;
          this.selectedImage = this.profileImages[this.selectedImageIndex];
        },
        error: (err) => {
          console.error('Error fetching profile:', err);
        }
      });
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

  createOrEdit() {
    if (this.isEdit) {
      this.update();
    } else {
      this.create();
    }
  }

  create() {
    this.profile.avatar_id = this.selectedImageIndex ? this.selectedImageIndex : 0;
    const profileToSend = { ...this.profile };
    delete profileToSend.id;

    this.addProfile(profileToSend);
  }

  update() {
    this.profile.avatar_id = this.selectedImageIndex ? this.selectedImageIndex : 0;
    this.updateProfile(this.profile.id!, this.profile);
  }

  delete() {
    this.deleteProfile(this.profile.id!)
  }

  addProfile(payload: any): void {
    this.loading = true;
    this.loadingBtn = 'add';
    this.restService.addProfile(payload).subscribe({
      error: (error) => {
        console.error('Error adding profile:', error);
      },
      complete: () => {
        this.loading = false;
        this.closeDialog.emit();
      }
    });
  }

  updateProfile(id: number, payload: any): void {
    this.loading = true;
    this.loadingBtn = 'edit';
    this.restService.updateProfile(id, payload).subscribe({
      error: (error) => {
        console.error(`Error updating profile ${id}:`, error);
      },
      complete: () => {
        this.loading = false;
        this.closeDialog.emit();
      }
    });
  }

  deleteProfile(id: number): void {
    this.loading = true;
    this.loadingBtn = 'delete';
    this.restService.deleteProfile(id).subscribe({
      error: (error) => {
        console.error(`Error deleting profile ${id}:`, error);
      },
      complete: () => {
        this.loading = false;
        this.closeDialog.emit();
      }
    });
  }

  close() {
    this.closeDialog.emit(null);
  }
}