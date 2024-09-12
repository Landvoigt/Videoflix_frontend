import { Component } from '@angular/core';
import { fadeIn } from '@utils/animations';
import { CommonModule } from '@angular/common';
import { NavigationService } from '@services/navigation.service';

@Component({
  selector: 'app-error-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './error-page.component.html',
  styleUrl: './error-page.component.scss',
  animations: [fadeIn]

})
export class ErrorPageComponent {

  constructor(public navService: NavigationService) { }

}