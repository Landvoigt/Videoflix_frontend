import { AfterViewInit, ApplicationRef, Component, ElementRef, EventEmitter, Input, NgZone, OnInit, Output, ViewChild} from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms';
// import { VideoService } from '../services/video.service';
import { HttpClient } from '@angular/common/http';
// import { Observable } from 'rxjs';
// import { catchError, map } from 'rxjs/operators';
import videojs from 'video.js';
import Hls from 'hls.js'; // Importiere hls.js
import { first } from 'rxjs';
import { VideoService } from '../services/video.service';
//import 'video.js/dist/video-js.css';


@Component({
  selector: 'app-video',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './video.component.html',
  styleUrl: './video.component.scss'
})


export class VideoComponent implements AfterViewInit {


 
isVideoPlaing = true;
videoUrl: string = '';
@Input() videoUrlGcs: string;
@Input() posterUrlGcs: string;
@Output() hover = new EventEmitter<boolean>();
@ViewChild('videoPlayer', { static: false }) videoPlayer: ElementRef<HTMLVideoElement>


  onHover() {
    this.videoPlayer.nativeElement.play(); 
    this.isVideoPlaing = true;
    this.hover.emit(true);
  }

  onLeave() {
    this.videoPlayer.nativeElement.pause();
    this.videoPlayer.nativeElement.currentTime = 0; 
    this.isVideoPlaing = false;
    this.hover.emit(false);
  }
  


  constructor(
    private http: HttpClient,
    private ngZone: NgZone,
    private appRef: ApplicationRef,
    private videoService: VideoService
  ) {}


  // ngOnInit(): void {
  //   this.setupVideoPlayer();
  // }
  

  ngAfterViewInit() {
    this.appRef.isStable.pipe(first(isStable => isStable)).subscribe(() => {
      const resolution = '360p';
      // const resolution = this.getResolution();
      console.log('Resolution: ', this.getResolution());
     this.getVideoUrl('waterfall_1', resolution);
    });

}
  

  getResolution(): string {
    const width = window.innerWidth;
    if (width >= 1920) {
      return '1080p';
    } else if (width >= 1280) {
      return '720p';
    } else if (width >= 854) {
      return '480p';
    } else {
      return '360p';
    }
  }

  getVideoUrl(videoKey: string, resolution: string) {
    const apiUrl = `http://localhost:8000/get-video-url/?video_key=${videoKey}&resolution=${resolution}`;

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



  setupVideoPlayer(): void {
    this.ngZone.runOutsideAngular(() => {
      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(this.videoUrlGcs);
        hls.attachMedia(this.videoPlayer.nativeElement);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          console.log('HLS manifest parsed');
        });
      } else if (this.videoPlayer.nativeElement.canPlayType('application/vnd.apple.mpegurl')) {
        this.videoPlayer.nativeElement.src = this.videoUrlGcs;
        this.videoPlayer.nativeElement.addEventListener('loadedmetadata', () => {
          console.log('Native HLS support, video loaded');
        });
      } else {
        console.error('HLS is not supported in this browser');
      }
    });
  }

//   setupVideoPlayer() {
//     this.ngZone.runOutsideAngular(() => {
//       if (Hls.isSupported()) {
//         const hls = new Hls();
//         hls.loadSource(this.videoUrl);
//         hls.attachMedia(this.videoPlayer.nativeElement);
//         hls.on(Hls.Events.MANIFEST_PARSED, () => {
//           console.log('HLS manifest parsed');
//         });
//       } else if (this.videoPlayer.nativeElement.canPlayType('application/vnd.apple.mpegurl')) {
//         this.videoPlayer.nativeElement.src = this.videoUrl;
//         this.videoPlayer.nativeElement.addEventListener('loadedmetadata', () => {
//           console.log('Native HLS support, video loaded');
//         });
//       } else {
//         console.error('HLS is not supported in this browser');
//       }
//     });
//   }
 }
