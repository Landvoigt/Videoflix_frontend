import { Component, ElementRef, OnInit, ViewChild} from '@angular/core';
//import { CommonModule } from '@angular/common'; 
//import { FormsModule } from '@angular/forms';
// import { VideoService } from '../services/video.service';
import { HttpClient } from '@angular/common/http';
// import { Observable } from 'rxjs';
// import { catchError, map } from 'rxjs/operators';
// import videojs from 'video.js';



@Component({
  selector: 'app-video',
  standalone: true,
  imports: [],
  templateUrl: './video.component.html',
  styleUrl: './video.component.scss'
})

export class VideoComponent implements OnInit {
  videoUrl: string = '';

  @ViewChild('videoPlayer', { static: false }) videoPlayer: ElementRef;

  constructor(private http: HttpClient) {}

  ngOnInit() {
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
        } else {
          console.error('Invalid response format from server'); 
        }
      },
      error: (error) => {
        console.error('Error fetching video URL:', error); 
      }
    });
  }
}







