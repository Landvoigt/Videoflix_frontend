import { trigger, state, style, transition, animate } from '@angular/animations';

export const fadeIn = trigger('fadeIn', [
    state('void', style({ opacity: 0 })),
    transition(':enter', [
        animate('125ms ease-in', style({ opacity: 1 }))
    ]),
]);

export const fadeInSlow = trigger('fadeInSlow', [
    state('void', style({ opacity: 0 })),
    transition(':enter', [
        animate('225ms ease-in', style({ opacity: 1 }))
    ]),
]);

export const fadeOutSlow = trigger('fadeOutSlow', [
    state('void', style({ opacity: 1 })),
    transition(':leave', [
        animate('225ms ease-in', style({ opacity: 0 }))
    ]),
]);

export const fadeInOut = trigger('fadeInOut', [
    state('void', style({ opacity: 0 })),
    transition(':enter', [
        animate('125ms ease-in', style({ opacity: 1 }))
    ]),
    transition(':leave', [
        animate('125ms ease-out', style({ opacity: 0 }))
    ])
]);

export const fadeInAlert = trigger('fadeInAlert', [
    state('void', style({ opacity: 0 })),
    transition(':enter, :leave', [
        animate(250)
    ])
]);