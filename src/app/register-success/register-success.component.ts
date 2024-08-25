import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { fadeInPage } from '@utils/animations';
import { NavigationService } from '@services/navigation.service';

@Component({
  selector: 'app-register-success',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './register-success.component.html',
  styleUrl: './register-success.component.scss',
  animations: [fadeInPage]
})
export class RegisterSuccessComponent {

  constructor(public navService: NavigationService) { }

}