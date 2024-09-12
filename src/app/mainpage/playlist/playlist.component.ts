import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { VideoService } from '@services/video.service';
import { VideoComponent } from '@video/video.component';
import { VideoData } from '@interfaces/video.interface';

@Component({
  selector: 'app-playlist',
  standalone: true,
  imports: [CommonModule, VideoComponent],
  templateUrl: './playlist.component.html',
  styleUrl: './playlist.component.scss'
})
export class PlaylistComponent implements OnInit {
  videos$: Observable<VideoData[]>;
  loading: boolean = false;

  constructor(private videoService: VideoService) { }

  ngOnInit(): void {
    this.getVideoData();
  }

  getVideoData(): void {
    this.loading = true;
    this.videos$ = this.videoService.getPlaylist();
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