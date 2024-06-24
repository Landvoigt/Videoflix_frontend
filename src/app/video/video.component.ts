import { Component, ElementRef,Input, ViewChild, OnDestroy,OnInit  } from '@angular/core';
import videojs from 'video.js';
import Player from 'video.js/dist/types/player';
@Component({
  selector: 'app-video',
  standalone: true,
  imports: [],
  templateUrl: './video.component.html',
  styleUrl: './video.component.scss'
})
export class VideoComponent implements OnInit, OnDestroy  {
  @ViewChild('target', {static: true}) target: ElementRef ;


 @Input() options: {
  fluid: boolean,
  aspectRatio: string,
  autoplay: boolean,
  sources: {
      src: string,
      type: string,
  }[],
};
 

player: Player ;
constructor(
  private elementRef: ElementRef,
) {}

ngOnInit() {
  this.player = videojs(this.target.nativeElement, this.options, function onPlayerReady() {
    console.log('Player is ready');
  });
}

ngOnDestroy() {
  if (this.player) {
    this.player.dispose();
  }
}




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