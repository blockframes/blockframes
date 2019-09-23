import { style, state, trigger, transition, animate, animation, keyframes, useAnimation } from '@angular/animations';

export const top = 'translateY(-100%)';
export const bot = 'translateY(100%)';
export const left = 'translateX(-100%)';
export const right = 'translateX(100%)';


export const slideIn = animation([
  style({ transform: '{{translate}}', opacity: 0 }),
  animate('500ms ease-in', style({ transform: 'translateX(0)', opacity: 1 }))
]);

export const slideOut = animation([
  animate('500ms ease-in', style({ transform: '{{translate}}', opacity: 1 }))
]);

export const slide = trigger('slideIn', [
  state('in', style({ opacity: 1 })),
  state('out', style({ opacity: 0 })),
  transition(':enter', [ 
    useAnimation(animation([
      style({ transform: '{{translate}}', opacity: 0 }),
      animate('500ms ease-in', style({ transform: 'translateX(0)', opacity: 1 }))
    ]), 
    {
      params: {
        translate: 'translateY(-100%)'
      }
    })
  ]),
  transition(':leave', [
    useAnimation(animation([
      animate('500ms ease-in', style({ transform: '{{translate}}', opacity: 1 }))
    ]), 
    {
      params: {
        translate: 'translateY(-100%)'
      }
    })
  ])
]);

export const slideCalendar = trigger('direction', [
  state('in', style({ opacity: 1 })),
  state('out', style({ opacity: 0 })),
  transition('void => left', [ 
    style({ transform: 'translateX(-350%)', opacity: 0 }),
    animate('300ms ease-in', style({ transform: 'translateX(0)', opacity: 1 }))
  ]),
  transition('void => right', [ 
    style({ transform: 'translateX(350%)', opacity: 0 }),
    animate('300ms ease-in', style({ transform: 'translateX(0)', opacity: 1 }))
  ]),
  transition('left => void', [
    animate('300ms ease-in', style({ opacity: 0 }))
  ]),
  transition('right => void', [
    animate('300ms ease-in', style({ opacity: 0 }))
  ])
]);

export const slideInTop = useAnimation(slideIn, {params: { transform: 'translateY(-100%)' }});
export const slideOutTop = useAnimation(slideOut, {params: { transform: 'translateY(-100%)' }});

export const slideInBot = useAnimation(slideIn, {params: { transform: 'translateY(100%)' }});
export const slideOutBot = useAnimation(slideOut, {params: { transform: 'translateY(100%)' }});

export const slideInLeft = useAnimation(slideIn, {params: { transform: 'translateX(-100%)' }});
export const slideOutLeft = useAnimation(slideOut, {params: { transform: 'translateX(-100%)' }});

export const slideInRight = useAnimation(slideIn, {params: { transform: 'translateX(100%)' }});
export const slideOutRight = useAnimation(slideOut, {params: { transform: 'translateX(100%)' }});

