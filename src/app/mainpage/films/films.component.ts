import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { VideoService } from '@services/video.service';
import { VideoComponent } from '@video/video.component';
import { VideoData } from '@interfaces/video.interface';
import { AlertService } from '@services/alert.service';
import { staggeredFadeIn } from '@utils/animations';

@Component({
  selector: 'app-films',
  standalone: true,
  imports: [CommonModule, VideoComponent],
  templateUrl: './films.component.html',
  styleUrl: './films.component.scss',
  animations: [staggeredFadeIn]
})
export class FilmsComponent implements OnInit {
  videoData: VideoData[] = [];
  category: string = 'film';
  loading: boolean = false;

  constructor(private videoService: VideoService, private alertService: AlertService) { }

  ngOnInit(): void {
    this.getVideoDataByCategory();
  }

  getVideoDataByCategory(): void {
    this.videoData = this.videoService.getVideoDataByCategory(this.category);
    if (this.videoData.length === 0) {
      this.loading = true;
      this.videoService.fetchVideoData(true);
    }
  }
}