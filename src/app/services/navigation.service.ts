import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {

  constructor(private router: Router, private location: Location) { }

  back() {
    this.location.back();
  }

  welcome() {
    this.router.navigate(['/welcome']);
  }

  login() {
    this.router.navigate(['/login']);
  }

  register() {
    this.router.navigate(['/register']);
  }

  registerSuccess() {
    this.router.navigate(['/register_success']);
  }

  sendMail() {
    this.router.navigate(['/send_mail']);
  }

  updateUsername() {
    this.router.navigate(['/update_username']);
  }

  profiles() {
    this.router.navigate(['/selection']);
  }

  main() {
    this.router.navigate(['/mainpage']);
  }

  imprint() {
    this.router.navigate(['/imprint']);
  }

  contact() {
    this.router.navigate(['/contact']);
  }

  policy() {
    this.router.navigate(['/policy']);
  }

  error(params: any) {
    this.router.navigate(['/error'], params);
  }
}