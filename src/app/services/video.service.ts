import Hls from 'hls.js';
import { ElementRef, Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { VideoResponse } from '../interfaces/video.interface';


@Injectable({
  providedIn: 'root'
})


export class VideoService {

  
  videoPlayer: ElementRef;
  descriptionUrl: string = "";
  titleUrl: string = "";
  copyVideoUrl: string;


  constructor(private http: HttpClient, private ngZone: NgZone) { }

  private apiUrl = "http://localhost:8000/poster-and-text/";

  getVideoData(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}`);
  }








//   loadAllVideoUrls(videoPlayer: ElementRef): void {
//     const apiUrl = `http://localhost:8000/get-all-video-urls/`;

//     this.http.get<{ video_urls: string[] }>(apiUrl).subscribe({
//       next: (response) => {
//         this.videoUrls = response.video_urls;
//         this.setupVideoPlayer(videoPlayer, this.videoUrls.length > 0 ? this.videoUrls[0] : '/assets/img/videostore/300.png');
//         if (this.videoUrls && this.videoUrls.length > 0) {
//           this.createVideoData();
//           this.getRandomVideoUrl();      
//         } else {
//           console.warn('No video URLs found in the response');
//         }
//       },
//       error: (error) => {
//         console.error('Error fetching video URLs:', error);
//       }
//     });
//   }


//   getRandomVideoUrl(): string {
//     const randomIndex = Math.floor(Math.random() * this.videoUrls.length);
//     this.randomDataName = this.getDirectoryNameFromUrl(this.videoUrls[randomIndex]);
//     this.getVideoUrl(this.randomDataName, '360p');
//     return this.videoUrls[randomIndex];
//   }


//   getDirectoryNameFromUrl(url: string): string {
//     const urlParts = url.split('/');
//     return urlParts[urlParts.length - 2];
//   }


//   getPosterFileName(videoUrlGcs: string): string {
//     if (!videoUrlGcs) {
//       return 'default-poster.jpg';
//     }
//     const urlParts = videoUrlGcs.split('/');
//     const lastPart = urlParts[urlParts.length - 2];
//     const fileName = lastPart + '.jpg';
//     return fileName;
//   }


//   createVideoData(): void {
//     this.getAllVideos().subscribe({
//       next: (data) => {
//         this.videoData = data.videos.map((video) => ({
//           videoUrlGcs: video.hls_playlist,
//           posterUrlGcs: video.hls_playlist
//             ? `https://storage.googleapis.com/videoflix-videos/video-posters/${this.getPosterFileName(video.hls_playlist)}`
//             : '/assets/img/videostore/300.png',
//           title: '',
//           description: '',
//         }));

//         this.videoData.forEach((video) => {
//           setTimeout(() => {
//             const subfolder = this.getSubfolderFromUrl(video.videoUrlGcs);
//             const gcsInfo = this.gcsData.find((item) => item.subfolder === subfolder);
//             if (gcsInfo) {
//               video.title = gcsInfo.title || '';
//               video.description = gcsInfo.description || '';
//             }

//           }, 3000);
//         });

//         console.log('Updated videoData:', this.videoData);
       
//       },
//       error: (error) => {
//         console.error('Error fetching video data:', error);
//       }
//     });
//   }


  
//   getAllVideos(): Observable<VideoResponse> {
//     const apiUrlVideos = 'http://localhost:8000/api/videos/';
//     return this.http.get<VideoResponse>(apiUrlVideos);
//   }


//   getSubfolderFromUrl(videoUrlGcs: string): string {
//     const parts = videoUrlGcs.split('/');
//     const subfolder = parts[parts.length - 2];
//     return subfolder;
//   }


//   getVideoUrl(videoKey: string, resolution: string): void {
//     const apiUrl = `http://localhost:8000/get-video-url/?video_key=${videoKey}&resolution=${resolution}`;
//     this.http.get<any>(apiUrl).subscribe({
//       next: (data) => {
//         if (data && data.video_url) {
//           this.videoUrl = data.video_url;  // Hauptvideo
//           this.videoUrls.push(data.video_url);
//           this.setupVideoPlayer(this.videoPlayer, this.videoUrl);
//           setTimeout(() => {
//              this.textForMainVideo(this.videoUrl); 
//           }, 3500);
         
//         } else {
//           console.error('Invalid response format from server');
//         }
//       },
//       error: (error) => {
//         console.error('Error fetching video URL:', error);
//       }
//     });
//   }


//   textForMainVideo(url:string): void {
//     console.log('url',url);
//     for (let index = 0; index < this.videoData.length; index++) {
//         const element = this.videoData[index];
//         const videoUrlGcs = element.videoUrlGcs;
//         const title = element.title;
//         const description = element.description;
//         if (this.getDirectoryNameFromUrl(url) === this.getDirectoryNameFromUrl(videoUrlGcs)) {
//             this.titleUrl = title; 
//             this.descriptionUrl = description;
//             break; 
//         }
//     }
// }



//   loadPosterUrls(): void {
//     const apiUrl = 'http://localhost:8000/get_poster_urls/';

//     this.http.get<any>(apiUrl).subscribe({
//       next: (response) => {
//         this.posterUrls = response.poster_urls;
//       },
//       error: (error) => {
//         console.error('Error fetching poster URLs:', error);
//       }
//     });

//   }


//   setupVideoPlayer(videoPlayer: ElementRef, videoUrl: any): void {
//     videoPlayer = this.videoPlayer;
//     if (!videoPlayer) {
//       console.error('Video player element is undefined');
//       return;
//     }

//     this.ngZone.runOutsideAngular(() => {
//       if (Hls.isSupported()) {
//         const hls = new Hls();
//         hls.loadSource(videoUrl);
//         hls.attachMedia(videoPlayer.nativeElement);
//         hls.on(Hls.Events.MANIFEST_PARSED, () => {
//           videoPlayer.nativeElement.play();
//         });
//       } else if (videoPlayer.nativeElement.canPlayType('application/vnd.apple.mpegurl')) {
//         videoPlayer.nativeElement.src = videoUrl;
//         videoPlayer.nativeElement.addEventListener('loadedmetadata', () => {
//           videoPlayer.nativeElement.play();
//         });
//       } else {
//         console.error('HLS is not supported in this browser');
//       }
//     });

//   }

//   // Text laden von gcs  
//   private gcsDataUrl = 'http://localhost:8000/gcs-data/';

//   fetchGcsData(): Observable<any[]> {
//     return this.http.get<any[]>(this.gcsDataUrl);
//   }

//   getGcsData(): any[] {
//     return this.gcsData;
//   }

//   loadGcsData(): void {
//     this.fetchGcsData().subscribe({
//       next: (data) => {
//         this.gcsData = data.map(item => ({
//           description_url: item.description_url,
//           subfolder: item.subfolder,
//           title_url: item.title_url,
//           description: '',
//           title: ''
//         }));
//         this.loadTextFileContents();
//         // console.log('GCS Data loaded:', this.gcsData);
//       },
//       error: (error) => {
//         console.error('Error fetching GCS data:', error);
//       }
//     });
//   }

//   private loadTextFileContents(): void {
//     const requests: Observable<any>[] = this.gcsData.map(item => {
//       const descriptionRequest = this.http.get(item.description_url, { responseType: 'text' });
//       const titleRequest = this.http.get(item.title_url, { responseType: 'text' });

//       return forkJoin({
//         description: descriptionRequest,
//         title: titleRequest
//       }).pipe(
//         map(response => {
//           item.description = response.description;
//           item.title = response.title;
//           return item;
//         })
//       );
//     });

//     forkJoin(requests).subscribe({
//       next: (updatedData) => {
//         this.gcsData = updatedData;
//         //console.log('GCS Data with text content loaded:', this.gcsData);
//       },
//       error: (error) => {
//         console.error('Error loading text file contents:', error);
//       }
//     });
//   }

}
