import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { VideoService } from '@services/video.service';
import { VideoComponent } from '@video/video.component';
import { VideoData } from '@interfaces/video.interface';
import { AlertService } from '@services/alert.service';
import { staggeredFadeIn } from '@utils/animations';

@Component({
  selector: 'app-series',
  standalone: true,
  imports: [CommonModule, VideoComponent],
  templateUrl: './series.component.html',
  styleUrl: './series.component.scss',
  animations: [staggeredFadeIn]
})
export class SeriesComponent implements OnInit {
  videos$: Observable<VideoData[]>;
  category: string = 'serie';
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
        this.alertService.showAlert('Cannot load any series. Please try again later', 'error');
        this.loading = false;
      }
    });
  }
}