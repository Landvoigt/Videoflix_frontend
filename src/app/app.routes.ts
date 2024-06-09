import { Routes } from '@angular/router';
import { MainpageComponent } from './mainpage/mainpage.component';
import { LoginComponent } from './login/login.component';
import { RegistryComponent } from './registry/registry.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { VideoComponent } from './video/video.component';

export const routes: Routes = [
    { path: '', component: MainpageComponent },
    { path: 'login', component: LoginComponent },
    { path: 'registry', component: RegistryComponent },
    { path: 'reset-password', component: ResetPasswordComponent },
    { path: 'video', component: VideoComponent },
];
