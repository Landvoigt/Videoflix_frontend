import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild, ChangeDetectorRef} from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { HttpClient } from '@angular/common/http';
import Hls from 'hls.js';
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
hls: Hls | null = null;

  constructor(
    private http: HttpClient,
    private videoService: VideoService,
    private cdr: ChangeDetectorRef
  ) {}


ngOnInit(): void {}


ngAfterViewInit() {}
  
onHover() {
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


getVideoUrl(videoKey: string, resolution: string): void {
  const apiUrl = `http://localhost:8000/preview-video/?video_key=${videoKey}&resolution=${resolution}`;
  this.http.get<{ video_url: string }>(apiUrl).subscribe({
    next: (data) => {
      if (data && data.video_url) {
        this.videoUrl = data.video_url;
        this.cdr.detectChanges();  
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
  const video: HTMLVideoElement = this.videoPlayer.nativeElement;

  if (Hls.isSupported()) {
    if (this.hls) {
      this.hls.destroy();
    }
    this.hls = new Hls();
    this.hls.loadSource(this.videoUrl);
    this.hls.attachMedia(video);
    this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
      video.play();
    });
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = this.videoUrl;
    video.addEventListener('loadedmetadata', () => {
      video.play();
    });
  } else {
    console.error('HLS not supported');
  }
}


}