import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild, ChangeDetectorRef, HostListener, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { HttpClient } from '@angular/common/http';
import Hls from 'hls.js';
import { VideoService } from '../services/video.service';
import 'video.js/dist/video-js.css';


@Component({
  selector: 'app-video',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './video.component.html',
  styleUrl: './video.component.scss'
})


export class VideoComponent implements OnInit{

 
videoUrl: string = '';
@Input() title: string;
@Input() description: string;
@Input() category: string;
@Input() videoUrlGcs: string;
@Input() posterUrlGcs: string;
@Output() hover = new EventEmitter<boolean>();
@ViewChild('videoPlayer', { static: true }) videoPlayer: ElementRef<HTMLVideoElement>
hls: Hls | null = null;
isFullscreen: boolean = false;
//videoUrl360p: string;
//hls360p: Hls;
hoverClass: boolean = false;




constructor(
    private http: HttpClient,
    ) {}

ngOnInit(): void {
  this.getScreenSize(); 
  window.addEventListener('resize', this.getScreenSize.bind(this)); 
}

ngOnDestroy(): void {
  window.removeEventListener('resize', this.getScreenSize.bind(this));
}


getVideoUrl(videoKey: string, resolution: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const apiUrl = `http://localhost:8000/full-video/?video_key=${videoKey}&resolution=${resolution}`;
    this.http.get<{ video_url: string }>(apiUrl).subscribe({
      next: (data) => {
        if (data && data.video_url) {
          resolve(data.video_url);
        } else {
          console.error('Invalid response format from server');
          reject('Invalid response format from server');
        }
      },
      error: (error) => {
        console.error('Error fetching video URL:', error);
        reject(error);
      }
    });
  });
}


setupVideoPlayer(resolution: string): void {
  const video: HTMLVideoElement = this.videoPlayer.nativeElement;
  const videoUrlPromise = this.getVideoUrl(this.extractFilename(this.posterUrlGcs), resolution);
  videoUrlPromise.then((videoUrl) => {
    if (!videoUrl) {
      console.error(`${resolution} video URL is not set`);
      return;
    }
    if (Hls.isSupported()) {
      if (this.hls) {
        this.hls.destroy();
      }
      this.hls = new Hls();
      this.hls.loadSource(videoUrl);
      this.hls.attachMedia(video);
      this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play(); 
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = videoUrl;
      video.addEventListener('loadedmetadata', () => {
        video.play(); 
      });
    } else {
      console.error('HLS not supported');
    }
  }).catch(error => {
    console.error('Error setting up video player:', error);
  });
}


onHover() {

  if (!this.posterUrlGcs) {
    console.error('posterUrlGcs is not set');
    return;
  }
  this.hover.emit(true); // ?
  const preViewName = this.extractFilename(this.posterUrlGcs);
  setTimeout(() => {
     this.hoverClass = true;
  }, 0);
 
  const resolution = this.getScreenSize();
  this.getVideoUrl(preViewName, resolution); 
  this.setupVideoPlayer(resolution); 
  this.startHoverTimeout();
 }


onLeave() {
   this.hoverClass = false;
  this.videoPlayer.nativeElement.pause();
  this.videoPlayer.nativeElement.currentTime = 0;
  this.hover.emit(false);
  this.hoverClass = false;



  if(!this.isFullscreen){
    this.stopVideoPlayer();
  }
  this.clearHoverTimeout();
}


@HostListener('document:fullscreenchange', ['$event'])
@HostListener('document:webkitfullscreenchange', ['$event'])
@HostListener('document:mozfullscreenchange', ['$event'])
@HostListener('document:MSFullscreenChange', ['$event'])
handleFullscreenChange(event: Event) {
  this.onFullscreenChange(event);
}


onFullscreenChange(event: Event) {
  this.isFullscreen = !!(document.fullscreenElement ||
    (document as any).webkitFullscreenElement ||
    (document as any).mozFullScreenElement ||
    (document as any).msFullscreenElement);

  if (this.isFullscreen) {
    this.hoverClass = false;
    const video: HTMLVideoElement = this.videoPlayer.nativeElement;
    video.currentTime = 0; 
  } else {
    this.stopVideoPlayer(); 
    this.hoverClass = true;
  }
}


extractFilename(url: string): string {
  return url.substring(url.lastIndexOf('/') + 1, url.lastIndexOf('.'));
}


getScreenSize(): string {
  const width = window.innerWidth;
  const height = window.innerHeight;
  let resolution: string;

  if (width >= 1920 && height >= 1080) {
    resolution = '1080p';
  } else if (width >= 1280 && height >= 720) {
    resolution = '720p';
  } else if (width >= 854 && height >= 480) {
    resolution = '480p';
  } else {
    resolution = '360p';
  }
  return resolution;
}


stopVideoPlayer(): void {
  const video: HTMLVideoElement = this.videoPlayer.nativeElement;

  if (this.hls) {
    this.hls.destroy();
    this.hls = null;
  } else {
    video.pause();
    video.src = '';
  }
}

hoverTimeout: any;
startHoverTimeout() {
  this.hoverTimeout = setTimeout(() => {
    this.hoverClass = true;
    const video: HTMLVideoElement = this.videoPlayer.nativeElement;
    video.currentTime = 0; 
    video.pause();
  }, 25000); 
}


clearHoverTimeout() {
  if (this.hoverTimeout) {
    clearTimeout(this.hoverTimeout);
    this.hoverTimeout = null;
  }
}






   
}









