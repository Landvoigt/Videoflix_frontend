import { trigger, state, style, transition, animate, query, stagger } from '@angular/animations';

export const fadeIn = trigger('fadeIn', [
    state('void', style({ opacity: 0 })),
    transition(':enter', [
        animate('125ms ease-in-out', style({ opacity: 1 }))
    ]),
]);

export const fadeInSlow = trigger('fadeInSlow', [
    state('void', style({ opacity: 0 })),
    transition(':enter', [
        animate('225ms ease-in-out', style({ opacity: 1 }))
    ]),
]);

export const fadeInSuperSlow = trigger('fadeInSuperSlow', [
    state('void', style({ opacity: 0 })),
    transition(':enter', [
        animate('455ms ease-in-out', style({ opacity: 1 }))
    ]),
]);

export const fadeOutSuperSlow = trigger('fadeOutSuperSlow', [
    state('void', style({ opacity: 1 })),
    transition(':leave', [
        animate('825ms ease-in-out', style({ opacity: 0 }))
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

export const staggeredFadeIn = trigger('staggeredFadeIn', [
    transition('* => *', [
        query(':enter', [
            style({ opacity: 0, transform: 'translateY(20px)' }),
            stagger('100ms', [
                animate('255ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
            ])
        ], { optional: true })
    ])
]);