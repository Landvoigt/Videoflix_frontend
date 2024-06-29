import { AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
//import { CommonModule } from '@angular/common'; 
//import { FormsModule } from '@angular/forms';
// import { VideoService } from '../services/video.service';
import { HttpClient } from '@angular/common/http';
// import { Observable } from 'rxjs';
// import { catchError, map } from 'rxjs/operators';
// import videojs from 'video.js';
import Hls from 'hls.js'; // Importiere hls.js


@Component({
  selector: 'app-video',
  standalone: true,
  imports: [],
  templateUrl: './video.component.html',
  styleUrl: './video.component.scss'
})

export class VideoComponent implements AfterViewInit {
  videoUrl: string = '';
  @ViewChild('videoPlayer', { static: false }) videoPlayer: ElementRef<HTMLVideoElement>;

  constructor(private http: HttpClient) {}

  ngAfterViewInit() {
    
    this.getVideoUrl('waterfall_1'); 
  }

  getVideoUrl(videoKey: string) {
    const apiUrl = `http://localhost:8000/get-video-url/?video_key=${videoKey}`;

    this.http.get<any>(apiUrl).subscribe({
      next: (data) => {
        console.log('Response from server:', data);
        if (data && data.video_url) {
          this.videoUrl = data.video_url;
          console.log('Updated videoUrl:', this.videoUrl);
          this.setupVideoPlayer();
        } else {
          console.error('Invalid response format from server');
        }
      },
      error: (error) => {
        console.error('Error fetching video URL:', error);
      }
    });
  }
  setupVideoPlayer() {
    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(this.videoUrl);
      hls.attachMedia(this.videoPlayer.nativeElement);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log('HLS manifest parsed');
        this.videoPlayer.nativeElement.play();
      });
    } else if (this.videoPlayer.nativeElement.canPlayType('application/vnd.apple.mpegurl')) {
      this.videoPlayer.nativeElement.src = this.videoUrl;
      this.videoPlayer.nativeElement.addEventListener('loadedmetadata', () => {
        console.log('Native HLS support, video loaded');
        this.videoPlayer.nativeElement.play();
      });
    } else {
      console.error('HLS is not supported in this browser');
    }
  }
}







