import { Component } from '@angular/core';
import { fadeInPage } from '../utils/animations';

@Component({
  selector: 'app-policy',
  standalone: true,
  imports: [],
  templateUrl: './policy.component.html',
  styleUrl: './policy.component.scss',
  animations: [fadeInPage]
})
export class PolicyComponent {

}
