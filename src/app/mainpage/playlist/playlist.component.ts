import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { VideoService } from '@services/video.service';
import { VideoComponent } from '@video/video.component';
import { VideoData } from '@interfaces/video.interface';
import { ProfileService } from '@services/profile.service';
import { AlertService } from '@services/alert.service';
import { staggeredFadeIn } from '@utils/animations';

@Component({
  selector: 'app-playlist',
  standalone: true,
  imports: [CommonModule, VideoComponent],
  templateUrl: './playlist.component.html',
  styleUrl: './playlist.component.scss',
  animations: [staggeredFadeIn]
})
export class PlaylistComponent implements OnInit {
  videos$: Observable<VideoData[]>;
  loading: boolean = false;
  viewList: string[] = [];

  constructor(private videoService: VideoService, private profileService: ProfileService, private alertService: AlertService) { }

  ngOnInit(): void {
    this.getViewList();
    this.getVideoDataByCategory();
  }

  getViewList() {
    const currentProfile = this.profileService.currentProfileSubject.value;
    this.viewList = currentProfile.liked_list;
  }

  getVideoDataByCategory(): void {
    this.loading = true;
    this.videos$ = this.videoService.getVideoDataByUrls(this.viewList);
    this.videos$.subscribe({
      next: () => {
        this.loading = false;
      },
      error: (error) => {
        this.alertService.showAlert('Cannot load playlist. Please try again later', 'error');
        this.loading = false;
      }
    });
  }
}