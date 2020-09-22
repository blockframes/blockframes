import {transition, trigger, query, style, animate, group, sequence } from '@angular/animations';
import { Easing } from './animation-easing';

/** Prepare page before leaving/entering (use absolute to get out of the page flow) */
const prepare = [
    style({ position: 'relative', minHeight: '100vh', overflow: 'hidden' }),
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        width: '100%',
        minHeight: '100vh',
        overflow: 'hidden'
      })
    ], { optional: true }),
];


/**
 * Router Animation
 * @note * => home: slide from bottom
 * @note list <=> list: slide from right
 * @note list <=> view: run local animation (else very slow)
 */
export const routeAnimation = trigger('routeAnimation', [
    // NEW
    transition('list => view, home => view, home => list', [
      ...prepare,
      query(':enter', [ style({ opacity: 0, transform: 'translateY(40vh)', boxShadow: '0px -2px 16px 0px rgba(0,0,0,0.3)' }) ], { optional: true }),
      group([
          query(':leave', [ animate(`200ms ${Easing.easeIncubic}`, style({ opacity: 0, transform: 'scale(0.95)' })) ], { optional: true }),
          query(':enter', [ animate(`500ms 100ms ${Easing.easeOutCirc}`, style({ opacity: 1, transform: 'translateY(0)' })) ], { optional: true })
      ]),
    ]),
    transition('view => list, view => home, list => home', [
      ...prepare,
      query(':enter', [ style({ opacity: 0, transform: 'scale(0.95)' }) ], { optional: true }),
      query(':leave', [ style({ zIndex: 1, boxShadow: '0px -2px 16px 0px rgba(0,0,0,0.3)' }) ], { optional: true }),
      group([
        query(':leave', [ animate(`500ms ${Easing.easeIncubic}`, style({ opacity: 0, transform: 'translateY(60vh)' })) ], { optional: true }),
        query(':enter', [ animate(`200ms 400ms ${Easing.easeOutCirc}`, style({ opacity: 1, transform: 'scale(1)' })) ], { optional: true }),
      ]),
    ]),
    transition(':increment', [
      ...prepare,
      query(':enter', [ style({ opacity: 0, transform: 'translateX(30vw)' }) ], { optional: true }),
      sequence([
        query(':leave', [ animate(`500ms ${Easing.easeIncubic}`, style({ opacity: 0, transform: 'translateX(-30vw)' })) ], { optional: true }),
        query(':enter', [ animate(`500ms ${Easing.easeOutcubic}`, style({ opacity: 1, transform: 'translateX(0)' })) ], { optional: true }),
      ]),
    ]),
    transition(':decrement', [
      ...prepare,
      query(':enter', [ style({ opacity: 0, transform: 'translateX(-30vw)' }) ], { optional: true }),
      sequence([
        query(':leave', [ animate(`500ms ${Easing.easeIncubic}`, style({ opacity: 0, transform: 'translateX(30vw)' })) ], { optional: true }),
        query(':enter', [ animate(`500ms ${Easing.easeOutcubic}`, style({ opacity: 1, transform: 'translateX(0)' })) ], { optional: true }),
      ]),
    ])
]);
