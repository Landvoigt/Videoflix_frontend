import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { VideoService } from '@services/video.service';
import { VideoComponent } from '@video/video.component';
import { VideoData } from '@interfaces/video.interface';
import { Observable } from 'rxjs';
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
  videos$: Observable<VideoData[]>;
  category: string = 'film';
  loading: boolean = false;

  constructor(private videoService: VideoService, private alertService: AlertService) { }

  ngOnInit(): void {
    this.getVideoDataByCategory();
  }

  getVideoDataByCategory(): void {
    this.loading = true;
    this.videos$ = this.videoService.getVideoDataByCategory(this.category);
    this.videos$.subscribe({
      next: () => {
        this.loading = false;
      },
      error: (error) => {
        this.alertService.showAlert('Cannot load any films. Please try again later', 'error');
        this.loading = false;
      }
    });
  }
}