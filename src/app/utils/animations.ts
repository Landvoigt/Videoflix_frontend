import { trigger, state, style, transition, animate } from '@angular/animations';

export const fadeInPage =
    trigger('fadeInPage', [
        state('void', style({ opacity: 0 })),
        transition(':enter', [
            animate('125ms ease-in', style({ opacity: 1 }))
        ])
    ]);


export const fadeInAlert =
    trigger('fadeInAlert', [
        state('void', style({ opacity: 0 })),
        transition(':enter, :leave', [
            animate(250)
        ])
    ]);