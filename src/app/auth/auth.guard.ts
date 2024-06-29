import { inject } from "@angular/core";
import { CanActivateFn } from "@angular/router";
import { AuthService } from "../auth/auth.service";

export const AuthGuard: CanActivateFn = (): boolean => {
    return inject(AuthService).canActivate();
}
export const RedirectIfLoggedInGuard: CanActivateFn = (): boolean => {
    return inject(AuthService).redirectIfLoggedIn();
}