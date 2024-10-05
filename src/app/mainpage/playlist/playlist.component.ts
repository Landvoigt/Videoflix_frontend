import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { VideoService } from '@services/video.service';
import { VideoComponent } from '@video/video.component';
import { VideoData } from '@interfaces/video.interface';
import { ProfileService } from '@services/profile.service';
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
  videoData: VideoData[] = [];
  loading: boolean = false;
  viewList: string[] = [];

  constructor(private videoService: VideoService, private profileService: ProfileService) { }

  ngOnInit(): void {
    this.getViewList();
    this.getVideoDataByCategory();
  }

  getViewList() {
    const currentProfile = this.profileService.currentProfileSubject.value;
    this.viewList = currentProfile.liked_list;
  }

  getVideoDataByCategory(): void {
    this.videoData = this.videoService.getVideoDataByUrls(this.viewList);
    if (this.videoData.length === 0) {
      this.loading = true;
      this.videoService.fetchVideoData(true);
    }
  }
}