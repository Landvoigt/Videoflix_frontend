import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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
  selector: 'app-films',
  standalone: true,
  imports: [CommonModule,VideoComponent],
  templateUrl: './films.component.html',
  styleUrl: './films.component.scss'
})
export class FilmsComponent implements OnInit {

  //allFilms: any[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  videoDataGcs: VideoData[] = []; 
  films: VideoData[] = [];
  title: string;
  description: string;
  posterUrlGcs: string = ''; 

  constructor(
   private videoService: VideoService
  ) {}

  ngOnInit(): void {
    this.videoService.fetchAndStoreVideoData();
    this.videoService.getStoredVideoData().subscribe(data => {
      this.videoDataGcs = data;
      console.log('Processed video data in FilmsComponent:', this.videoDataGcs);
     });
     this.films = this.videoDataGcs.filter(video => video.category === 'film');
     console.log('Films:', this.films);
  }

}
