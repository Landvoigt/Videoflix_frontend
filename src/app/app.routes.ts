import { RouterModule, Routes } from '@angular/router';
import { MainpageComponent } from './mainpage/mainpage.component';
import { LoginComponent } from './login/login.component';
import { RegistryComponent } from './registry/registry.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { VideoComponent } from './video/video.component';
import { SendMailComponent } from './send-mail/send-mail.component';
import { NgModule } from '@angular/core';

export const routes: Routes = [
    { path: '', component: MainpageComponent },
    { path: 'login', component: LoginComponent },
    { path: 'registry', component: RegistryComponent },
    { path: 'send_mail', component: SendMailComponent },
    { path: 'reset_password', component: ResetPasswordComponent },
    { path: 'video', component: VideoComponent },
];
@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
  })
  export class AppRoutingModule { }