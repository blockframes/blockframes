import { trigger, transition, style, query, animateChild, group, animate, keyframes } from "@angular/animations";
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


export const slideInAnimation =
  trigger('slideInAnimation', [
    transition('FirstPage => SecondPage => ThirdPage...', [
      style({ position: 'relative' }),
      query(':enter, :leave', [
        style({
          position: 'absolute',
          width: '100%'
        })
      ]),
      query(':enter', [
        style({ left: '100%' })
      ]),
      query(':leave', animateChild()),
      group([
        query(':leave', [
          animate('300ms ease-out', style({ left: '-100%' }))
        ]),
        query(':enter', [
          animate('300ms ease-out', style({ left: '0%' }))
        ])
      ]),
      query(':enter', animateChild()),
    ]),

    transition('FirstPage => SecondPage => ThirdPage...', [
      style({ position: 'relative' }),
      query(':enter, :leave', [
        style({
          position: 'absolute',
          width: '100%'
        })
      ]),
      query(':enter', [
        style({ left: '-100%' })
      ]),
      query(':leave', animateChild()),
      group([
        query(':leave', [
          animate('300ms ease-out', style({ left: '100%' }))
        ]),
        query(':enter', [
          animate('300ms ease-out', style({ left: '0%' }))
        ])
      ]),
      query(':enter', animateChild()),
    ]),

    transition('FirstPage => SecondPage => ThirdPage...', [
      style({ position: 'relative' }),
      query(':enter, :leave', [
        style({
          position: 'absolute',
          width: '100%'
        })
      ]),
      query(':enter', [
        style({ left: '100%' })
      ]),
      query(':leave', animateChild()),
      group([
        query(':leave', [
          animate('300ms ease-out', keyframes([
            style({
              opacity: 1,
              offset: 0
            }),
            style({
              opacity: 0,
              transform: 'scale3d(1.3, 1.3, 1.3)',
              offset: 0.5
            }),
            style({
              opacity: 0,
              offset: 1
            })
          ]))
        ]),
        query(':enter', [
          animate('300ms ease-out', keyframes([
            style({
              opacity: 0,
              transform: 'scale3d(.3, .3, .3)',
              offset: 0
            }),
            style({
              opacity: 1,
              transform: 'scale3d(1, 1, 1)',
              offset: 0.5
            })
          ]))
        ])
      ]),
      query(':enter', animateChild()),
    ]),

    transition('FirstPage => SecondPage => ThirdPage...', [
      style({ position: 'relative' }),
      query(':enter, :leave', [
        style({
          position: 'absolute',
          width: '100%'
        })
      ]),
      query(':enter', [
        style({ left: '100%' })
      ]),
      query(':leave', animateChild()),
      group([
        query(':leave', [
          animate('300ms ease-out', keyframes([
            style({
              opacity: 1,
              offset: 0
            }),
            style({
              opacity: 0,
              transform: 'scale3d(.3, .3, .3)',
              offset: 0.5
            }),
            style({
              opacity: 0,
              offset: 1
            })
          ]))
        ]),
        query(':enter', [
          animate('300ms ease-out', keyframes([
            style({
              opacity: 0,
              transform: 'scale3d(.3, .3, .3)',
              offset: 0
            }),
            style({
              opacity: 1,
              transform: 'scale3d(1, 1, 1)',
              offset: 0.5
            })
          ]))
        ])
      ]),
      query(':enter', animateChild()),
    ]),
  ]);

export const slideInTop = useAnimation(slideIn, { params: { transform: 'translateY(-100%)' } });
export const slideOutTop = useAnimation(slideOut, { params: { transform: 'translateY(-100%)' } });

export const slideInBot = useAnimation(slideIn, { params: { transform: 'translateY(100%)' } });
export const slideOutBot = useAnimation(slideOut, { params: { transform: 'translateY(100%)' } });

export const slideInLeft = useAnimation(slideIn, { params: { transform: 'translateX(-100%)' } });
export const slideOutLeft = useAnimation(slideOut, { params: { transform: 'translateX(-100%)' } });

export const slideInRight = useAnimation(slideIn, { params: { transform: 'translateX(100%)' } });
export const slideOutRight = useAnimation(slideOut, { params: { transform: 'translateX(100%)' } });
