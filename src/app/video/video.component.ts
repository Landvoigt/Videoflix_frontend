import { AfterViewInit, ApplicationRef, Component, ElementRef, NgZone, OnInit, ViewChild} from '@angular/core';
//import { CommonModule } from '@angular/common'; 
//import { FormsModule } from '@angular/forms';
// import { VideoService } from '../services/video.service';
import { HttpClient } from '@angular/common/http';
// import { Observable } from 'rxjs';
// import { catchError, map } from 'rxjs/operators';
// import videojs from 'video.js';
import Hls from 'hls.js'; // Importiere hls.js
import { first } from 'rxjs';


@Component({
  selector: 'app-video',
  standalone: true,
  imports: [],
  templateUrl: './video.component.html',
  styleUrl: './video.component.scss'
})

// export class VideoComponent implements AfterViewInit {
//   videoUrl: string = '';
//   @ViewChild('videoPlayer', { static: false }) videoPlayer: ElementRef<HTMLVideoElement>;

//   constructor(private http: HttpClient) {}

//   ngAfterViewInit() {
    
//     this.getVideoUrl('scooter'); 
//   }

//   getVideoUrl(videoKey: string) {
//     const apiUrl = `http://localhost:8000/get-video-url/?video_key=${videoKey}`;

//     this.http.get<any>(apiUrl).subscribe({
//       next: (data) => {
//         console.log('Response from server:', data);
//         if (data && data.video_url) {
//           this.videoUrl = data.video_url;
//           console.log('Updated videoUrl:', this.videoUrl);
//           this.setupVideoPlayer();
//         } else {
//           console.error('Invalid response format from server');
//         }
//       },
//       error: (error) => {
//         console.error('Error fetching video URL:', error);
//       }
//     });
//   }
//   setupVideoPlayer() {
//     if (Hls.isSupported()) {
//       const hls = new Hls();
//       hls.loadSource(this.videoUrl);
//       hls.attachMedia(this.videoPlayer.nativeElement);
//       hls.on(Hls.Events.MANIFEST_PARSED, () => {
//         console.log('HLS manifest parsed');
//         this.videoPlayer.nativeElement.play();
//       });
//     } else if (this.videoPlayer.nativeElement.canPlayType('application/vnd.apple.mpegurl')) {
//       this.videoPlayer.nativeElement.src = this.videoUrl;
//       this.videoPlayer.nativeElement.addEventListener('loadedmetadata', () => {
//         console.log('Native HLS support, video loaded');
//         this.videoPlayer.nativeElement.play();
//       });
//     } else {
//       console.error('HLS is not supported in this browser');
//     }
//   }
// }



// export class VideoComponent implements AfterViewInit {    Ez ajo
//   videoUrl: string = '';
//   @ViewChild('videoPlayer', { static: false }) videoPlayer: ElementRef<HTMLVideoElement>;

//   constructor(private http: HttpClient) {}

//   ngAfterViewInit() {
//     const resolution = this.getResolution();
//     console.log('getResolution()', this.getResolution());
//     this.getVideoUrl('scooter', resolution);
//   }

//   getResolution(): string {
//     const width = window.innerWidth;
//     if (width >= 1920) {
//       return '1080p';
//     } else if (width >= 1280) {
//       return '720p';
//     } else if (width >= 854) {
//       return '480p';
//     } else {
//       return '360p';
//     }
    
//   }

//   getVideoUrl(videoKey: string, resolution: string) {
//     const apiUrl = `http://localhost:8000/get-video-url/?video_key=${videoKey}&resolution=${resolution}`;

//     this.http.get<any>(apiUrl).subscribe({
//       next: (data) => {
//         console.log('Response from server:', data);
//         if (data && data.video_url) {
//           this.videoUrl = data.video_url;
//           console.log('Updated videoUrl:', this.videoUrl);
//           this.setupVideoPlayer();
//         } else {
//           console.error('Invalid response format from server');
//         }
//       },
//       error: (error) => {
//         console.error('Error fetching video URL:', error);
//       }
//     });
//   }

//   setupVideoPlayer() {
//     if (Hls.isSupported()) {
//       const hls = new Hls();
//       hls.loadSource(this.videoUrl);
//       hls.attachMedia(this.videoPlayer.nativeElement);
//       hls.on(Hls.Events.MANIFEST_PARSED, () => {
//         console.log('HLS manifest parsed');
//         this.videoPlayer.nativeElement.play();
//       });
//     } else if (this.videoPlayer.nativeElement.canPlayType('application/vnd.apple.mpegurl')) {
//       this.videoPlayer.nativeElement.src = this.videoUrl;
//       this.videoPlayer.nativeElement.addEventListener('loadedmetadata', () => {
//         console.log('Native HLS support, video loaded');
//         this.videoPlayer.nativeElement.play();
//       });
//     } else {
//       console.error('HLS is not supported in this browser');
//     }
//   }
// }







// export class VideoComponent implements AfterViewInit {
//   videoUrl: string = '';
//   @ViewChild('videoPlayer', { static: false }) videoPlayer: ElementRef<HTMLVideoElement>;

//   constructor(private http: HttpClient, private ngZone: NgZone) {}

//   ngAfterViewInit() {
//     const resolution = this.getResolution();
//     this.getVideoUrl('scooter', resolution);
//   }

//   getResolution(): string {
//     const width = window.innerWidth;
//     if (width >= 1920) {
//       return '1080p';
//     } else if (width >= 1280) {
//       return '720p';
//     } else if (width >= 854) {
//       return '480p';
//     } else {
//       return '360p';
//     }
//   }

//   getVideoUrl(videoKey: string, resolution: string) {
//     const apiUrl = `http://localhost:8000/get-video-url/?video_key=${videoKey}&resolution=${resolution}`;

//     this.http.get<any>(apiUrl).subscribe({
//       next: (data) => {
//         console.log('Response from server:', data);
//         if (data && data.video_url) {
//           this.videoUrl = data.video_url;
//           console.log('Updated videoUrl:', this.videoUrl);
//           this.setupVideoPlayer();
//         } else {
//           console.error('Invalid response format from server');
//         }
//       },
//       error: (error) => {
//         console.error('Error fetching video URL:', error);
//       }
//     });
//   }

//   setupVideoPlayer() {
//     this.ngZone.runOutsideAngular(() => {
//       if (Hls.isSupported()) {
//         const hls = new Hls();
//         hls.loadSource(this.videoUrl);
//         hls.attachMedia(this.videoPlayer.nativeElement);
//         hls.on(Hls.Events.MANIFEST_PARSED, () => {
//           console.log('HLS manifest parsed');
//           this.videoPlayer.nativeElement.play();
//         });
//       } else if (this.videoPlayer.nativeElement.canPlayType('application/vnd.apple.mpegurl')) {
//         this.videoPlayer.nativeElement.src = this.videoUrl;
//         this.videoPlayer.nativeElement.addEventListener('loadedmetadata', () => {
//           console.log('Native HLS support, video loaded');
//           this.videoPlayer.nativeElement.play();
//         });
//       } else {
//         console.error('HLS is not supported in this browser');
//       }
//     });
//   }
// }


// export class VideoComponent implements AfterViewInit {     //ez is jo, csak hiba 
//   videoUrl: string = '';
//   @ViewChild('videoPlayer', { static: false }) videoPlayer: ElementRef<HTMLVideoElement>;
  
//   constructor(
//     private http: HttpClient, 
//     private ngZone: NgZone, 
//     private appRef: ApplicationRef
//   ) {}

//   ngAfterViewInit() {
//     this.appRef.isStable.pipe(first(isStable => isStable)).subscribe(() => {
//       const resolution = this.getResolution();
//       this.getVideoUrl('scooter', resolution);
//     });
//   }

//   getResolution(): string {
//     const width = window.innerWidth;
//     if (width >= 1920) {
//       return '1080p';
//     } else if (width >= 1280) {
//       return '720p';
//     } else if (width >= 854) {
//       return '480p';
//     } else {
//       return '360p';
//     }
//   }

//   getVideoUrl(videoKey: string, resolution: string) {
//     const apiUrl = `http://localhost:8000/get-video-url/?video_key=${videoKey}&resolution=${resolution}`;

//     this.http.get<any>(apiUrl).subscribe({
//       next: (data) => {
//         console.log('Response from server:', data);
//         if (data && data.video_url) {
//           this.videoUrl = data.video_url;
//           console.log('Updated videoUrl:', this.videoUrl);
//           this.setupVideoPlayer();
//         } else {
//           console.error('Invalid response format from server');
//         }
//       },
//       error: (error) => {
//         console.error('Error fetching video URL:', error);
//       }
//     });
//   }

//   setupVideoPlayer() {
//     this.ngZone.runOutsideAngular(() => {
//       if (Hls.isSupported()) {
//         const hls = new Hls();
//         hls.loadSource(this.videoUrl);
//         hls.attachMedia(this.videoPlayer.nativeElement);
//         hls.on(Hls.Events.MANIFEST_PARSED, () => {
//           console.log('HLS manifest parsed');
//           this.videoPlayer.nativeElement.play();
//         });
//       } else if (this.videoPlayer.nativeElement.canPlayType('application/vnd.apple.mpegurl')) {
//         this.videoPlayer.nativeElement.src = this.videoUrl;
//         this.videoPlayer.nativeElement.addEventListener('loadedmetadata', () => {
//           console.log('Native HLS support, video loaded');
//           this.videoPlayer.nativeElement.play();
//         });
//       } else {
//         console.error('HLS is not supported in this browser');
//       }
//     });
//   }
// }

export class VideoComponent implements AfterViewInit {
  videoUrl: string = '';
  @ViewChild('videoPlayer', { static: false }) videoPlayer: ElementRef<HTMLVideoElement>;

  constructor(
    private http: HttpClient,
    private ngZone: NgZone,
    private appRef: ApplicationRef
  ) {}

  ngAfterViewInit() {
    this.appRef.isStable.pipe(first(isStable => isStable)).subscribe(() => {
      const resolution = this.getResolution();
      console.log('Resolution: ', this.getResolution());
      this.getVideoUrl('jellyfish', resolution);
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

  setupVideoPlayer() {
    this.ngZone.runOutsideAngular(() => {
      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(this.videoUrl);
        hls.attachMedia(this.videoPlayer.nativeElement);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          console.log('HLS manifest parsed');
        });
      } else if (this.videoPlayer.nativeElement.canPlayType('application/vnd.apple.mpegurl')) {
        this.videoPlayer.nativeElement.src = this.videoUrl;
        this.videoPlayer.nativeElement.addEventListener('loadedmetadata', () => {
          console.log('Native HLS support, video loaded');
        });
      } else {
        console.error('HLS is not supported in this browser');
      }
    });
  }
}
