import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { VideoService } from '@services/video.service';
import { VideoComponent } from '@video/video.component';
import { VideoData } from '@interfaces/video.interface';

@Component({
  selector: 'app-series',
  standalone: true,
  imports: [CommonModule, VideoComponent],
  templateUrl: './series.component.html',
  styleUrl: './series.component.scss'
})
export class SeriesComponent implements OnInit {
  videos$: Observable<VideoData[]>;
  category: string = 'serie';
  loading: boolean = false;

  constructor(private videoService: VideoService) { }

  ngOnInit(): void {
    this.getVideoData();
  }

  getVideoData(): void {
    this.loading = true;
    this.videos$ = this.videoService.getVideoData(this.category);
    this.videos$.subscribe({
      next: () => {
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading films:', error);
        this.loading = false;
      }
    });
  }
}