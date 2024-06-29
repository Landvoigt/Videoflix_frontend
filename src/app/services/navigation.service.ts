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

  profile() {
    this.router.navigate(['/selection']);
  }

  main() {
    this.router.navigate(['/mainpage']);
  }

  error(params: any) {
    this.router.navigate(['/error'], params);
  }
}