import { AfterViewInit, ApplicationRef, Component, ElementRef, EventEmitter, Input, NgZone, Output, ViewChild} from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { HttpClient } from '@angular/common/http';
import Hls from 'hls.js';
import { first } from 'rxjs';
import { VideoService } from '../services/video.service';
import { Video } from '../../models/video.model';

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
videos: Video[] = [];
@Input() title: string;
@Input() description: string;
@Input() videoUrlGcs: string;
@Input() posterUrlGcs: string;
@Output() hover = new EventEmitter<boolean>();
@ViewChild('videoPlayer', { static: true }) videoPlayer: ElementRef<HTMLVideoElement>

  constructor(
    private http: HttpClient,
    private ngZone: NgZone,
    private appRef: ApplicationRef,
    private videoService: VideoService
  ) {}


   ngOnInit(): void {
   
    
   }


ngAfterViewInit() {
    // this.appRef.isStable.pipe(first(isStable => isStable)).subscribe(() => {
    //   const resolution = '360p';
    //    this.getVideoUrl('waterfall_1', resolution);
    // });
}
  
onHover() {
  // this.videoPlayer.nativeElement.play(); 
  // this.isVideoPlaing = true;
  // this.hover.emit(true);
  
  console.log('Title:', this.title);
  console.log('Description:', this.description);
  console.log('Poster URL:', this.posterUrlGcs);
  const preViewName =  this.extractFilename(this.posterUrlGcs);
  console.log('preViewName', preViewName);
  this.getVideoUrl(preViewName,'360p'); 
 
}


extractFilename(posterUrl: string): string {
  const urlObject = new URL(posterUrl);
  const pathname = urlObject.pathname;
  const filenameWithExtension = pathname.substring(pathname.lastIndexOf('/') + 1);
  const filename = filenameWithExtension.split('.')[0];
  console.log('filename',filename);
  return filename;
}

onLeave() {
  this.videoPlayer.nativeElement.pause();
  this.videoPlayer.nativeElement.currentTime = 0; 
  this.isVideoPlaing = false;
  this.hover.emit(false);
}


// onFullScreen() {
//   const videoElement = this.videoPlayer.nativeElement;
//   if (videoElement.requestFullscreen) {
//     videoElement.requestFullscreen();
//      this.isVideoPlaing = true;
//      videoElement.play(); 
//      console.log('URL:', this.videoUrlGcs);
//   }
// }


  // getVideoUrl(videoKey: string, resolution: string) {
  //   const apiUrl = `http://storage.googleapis.com/videoflix-videos/hls/${videoKey}/${resolution}.m3u8`;

  //   this.http.get<any>(apiUrl).subscribe({
  //     next: (data) => {
  //       if (data && data.video_url) {
  //         this.videoUrl = data.video_url;
  //         this.setupVideoPlayer();
  //       } else {
  //         console.error('Invalid response format from server');
  //       }
  //     },
  //     error: (error) => {
  //       console.error('Error fetching video URL:', error);
  //     }
  //   });
  // }

 
//   getVideoUrl(videoKey: string, resolution: string): void {
//     const apiUrl = `http://storage.googleapis.com/videoflix-videos/hls/${videoKey}/${resolution}.m3u8`;

//     this.videoUrl = apiUrl;
//     this.setupVideoPlayer();
// }

//   setupVideoPlayer(): void {
//     this.ngZone.runOutsideAngular(() => {
//       if (Hls.isSupported()) {
//         const hls = new Hls();
//         hls.loadSource(this.videoUrlGcs);
//         hls.attachMedia(this.videoPlayer.nativeElement);
//         hls.on(Hls.Events.MANIFEST_PARSED, () => {
//         });
//       } else if (this.videoPlayer.nativeElement.canPlayType('application/vnd.apple.mpegurl')) {
//         this.videoPlayer.nativeElement.src = this.videoUrlGcs;
//         this.videoPlayer.nativeElement.addEventListener('loadedmetadata', () => {
//         });
//       } else {
//         console.error('HLS is not supported in this browser');
//       }
//     });
//   }


getVideoUrl(videoKey: string, resolution: string): void {
  const apiUrl = `https://storage.googleapis.com/videoflix-videos/hls/${videoKey}/${resolution}.m3u8`;
  this.videoUrl = apiUrl;
  this.setupVideoPlayer();
}

setupVideoPlayer(): void {
  const video: HTMLVideoElement = this.videoPlayer.nativeElement;
  if (Hls.isSupported()) {
    const hls = new Hls();
    hls.loadSource(this.videoUrl);
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      video.play();
    });
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = this.videoUrl;
    video.addEventListener('loadedmetadata', () => {
      video.play();
    });
  }
}
 }
