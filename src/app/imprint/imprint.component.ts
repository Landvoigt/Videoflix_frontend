import { Component } from '@angular/core';
import { fadeInPage } from '../utils/animations';

@Component({
  selector: 'app-imprint',
  standalone: true,
  imports: [],
  templateUrl: './imprint.component.html',
  styleUrl: './imprint.component.scss',
  animations: [fadeInPage]
})
export class ImprintComponent {

}
