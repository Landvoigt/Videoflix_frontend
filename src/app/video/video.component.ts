import { Component} from '@angular/core';

@Component({
  selector: 'app-video',
  standalone: true,
  imports: [],
  templateUrl: './video.component.html',
  styleUrl: './video.component.scss'
})
export class VideoComponent {

}



//gsutil cors set C:\Users\Laptop\Desktop\config\cors-config.json gs://videoflix-videos

// [
//   {
//     "origin": ["http://localhost:4200"],
//     "responseHeader": ["Content-Type", "Authorization"],
//     "method": ["GET", "HEAD", "OPTIONS"],
//     "maxAgeSeconds": 3600
//   }
// ]