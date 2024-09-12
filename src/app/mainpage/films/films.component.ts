import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { VideoService } from '@services/video.service';
import { VideoComponent } from '@video/video.component';
import { VideoData } from '@interfaces/video.interface';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-films',
  standalone: true,
  imports: [CommonModule, VideoComponent],
  templateUrl: './films.component.html',
  styleUrl: './films.component.scss'
})
export class FilmsComponent implements OnInit {
  videos$: Observable<VideoData[]>;
  category: string = 'film';
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