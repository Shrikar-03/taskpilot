// animations.ts
import { trigger, transition, style, animate } from '@angular/animations';

export const slideInAnimation = trigger('routeAnimation', [
  transition(':enter', [
    style({ transform: 'translateX(-100%)' }),
    animate('300ms', style({ transform: 'translateX(0%)' }))
  ]),
  transition(':leave', [
    style({ transform: 'translateX(0%)' }),
    animate('300ms', style({ transform: 'translateX(100%)' }))
  ])
]);
