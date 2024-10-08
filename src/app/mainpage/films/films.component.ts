import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { VideoService } from '@services/video.service';
import { VideoComponent } from '@video/video.component';
import { VideoData } from '@interfaces/video.interface';
import { fadeInOut, staggeredFadeIn } from '@utils/animations';

@Component({
  selector: 'app-films',
  standalone: true,
  imports: [CommonModule, VideoComponent],
  templateUrl: './films.component.html',
  styleUrl: './films.component.scss',
  animations: [staggeredFadeIn, fadeInOut]
})
export class FilmsComponent implements OnInit {
  videoData: VideoData[] = [];
  category: string = 'film';
  loading: boolean = true;

  constructor(private videoService: VideoService) { }

  ngOnInit(): void {
    this.getVideoDataByCategory();
  }

  getVideoDataByCategory(): void {
    this.videoData = this.videoService.getVideoDataByCategory(this.category);
    
    if (this.videoData.length === 0) {
      this.videoService.fetchVideoData(true);
    }

    this.loading = false;
  }
}