import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { VideoService } from '../../services/video.service';
import { VideoComponent } from '../../video/video.component';

export interface VideoData {
  subfolder: string;
  description: string;
  title: string;
  posterUrlGcs?: string; 
  category: string;
}


@Component({
  selector: 'app-playlist',
  standalone: true,
  imports: [CommonModule, VideoComponent],
  templateUrl: './playlist.component.html',
  styleUrl: './playlist.component.scss'
})
export class PlaylistComponent implements OnInit {
  //playlist: any[] = [1, 2, 3, 4, 5, 6];
  videoDataGcs: VideoData[] = []; 
  myFilms: VideoData[] = [];
  myFilmsName = [];
  title: string;
  description: string;
  posterUrlGcs: string = ''; 

  constructor(
   private videoService: VideoService,
   private http: HttpClient
  ) {}

  private apiUrl = "http://localhost:8000/list-myFilms/";

  ngOnInit(): void {
  this.getMyFilms().subscribe({
    next: (data) => {
      this.myFilmsName = data;
      this.videoService.fetchAndStoreVideoData();
      this.videoService.getStoredVideoData().subscribe(videoData => {
        this.videoDataGcs = videoData;
        this.myFilms = this.videoDataGcs.filter(video =>
          this.myFilmsName['subfolders'].includes(video.subfolder)
        );
      });
    },
    error: (error) => {
      console.error('Fehler beim Abrufen der Daten:', error);
    }
  });

  }

  getMyFilms(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

}
