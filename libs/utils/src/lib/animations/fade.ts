import {transition, trigger, style, animate, query, stagger } from '@angular/animations';
import { Easing } from './animation-easing';

///////////
// SCALE //
///////////

const scale = (name: string, size: number) => trigger(name, [
  transition(':enter', [
    style({ opacity: '0', transform: `scale(${size})` }),
    animate(`0.2s ${Easing.easeOutcubic}`, style({opacity: '1', transform: 'scale(1)'})
 )]),
  transition(':leave', [
    style({opacity: '1', transform: 'scale(1)'}),
    animate(`0.2s ${Easing.easeIncubic}`, style({opacity: '0', transform: `scale(${size})`})
 )])
]);
/** Animation used for view-like pages */
export const scaleIn = scale('scaleIn', 0.95);
/** Animation used for view-like pages */
export const scaleOut = scale('scaleOut', 1.1);

const scaleList = (name: string, size: number) => (selector: string) => trigger(name, [
  transition(':enter', [
    query(selector, [
      style({  opacity: 0, transform: `scale(${size})` }),
      stagger(-30, [animate(`0.2s ${Easing.easeOutcubic}`, style({opacity: 1, transform: 'scale(1)'}))])
    ], { optional: true }),
  ]),
  transition(':leave', [
    query(selector, [
      style({ opacity: 1, transform: 'scale(1)'}),
      stagger(30, [animate(`0.2s ${Easing.easeIncubic}`, style({opacity: 1, transform: `scale(${size})`}))])
    ], { optional: true }),
  ])
]);

/** Animation used for view-like pages */
export const scaleInList = scaleList('scaleInList', 0.95);
/** Animation used for view-like pages */
export const scaleOutList = scaleList('scaleOutList', 1.1);



///////////
// SLIDE //
///////////
const slide = (name: string, distance: string) => trigger(name, [
  transition(':enter', [
    style({ opacity: '0', transform: `translateY(${distance})` }),
    animate(`0.2s ${Easing.easeOutcubic}`, style({opacity: '1', transform: 'translateY(0)'})
 )]),
  transition(':leave', [
    style({opacity: '1', transform: 'translateY(0)'}),
    animate(`0.2s ${Easing.easeIncubic}`, style({opacity: '0', transform: `translateY(${distance})`})
 )])
]);
/** Animation used for view-like pages */
export const slideDown = slide('slideDown', '-20px');
/** Animation used for view-like pages */
export const slideUp = slide('slideUp', '20px');

const slideList = (name: string, distance: string) => (selector: string) => trigger(name, [
  transition(':enter', [
    query(selector, [
      style({  opacity: 0, transform: `translateY(${distance})` }),
      stagger(30, [animate(`0.2s ${Easing.easeOutcubic}`, style({opacity: 1, transform: 'translateY(0)'}))])
    ], { optional: true }),
  ]),
  transition(':leave', [
    query(selector, [
      style({ opacity: 1, transform: 'translateY(0)'}),
      stagger(-30, [animate(`0.2s ${Easing.easeIncubic}`, style({opacity: 1, transform: `translateY(${distance})`}))])
    ], { optional: true }),
  ])
]);

/** Animation used for view-like pages */
export const slideDownList = slideList('slideDownList', '-20px');
/** Animation used for view-like pages */
export const slideUpList = slideList('slideUpList', '20px');





export const fade = trigger('fade', [
  transition(':enter', [
    style({ opacity: '0', transform: 'scale(0.95)' }),
    animate(`0.3s ${Easing.easeOutcubic}`, style({opacity: '1', transform: 'scale(1)'})
 )]),
  transition(':leave', [
    style({opacity: '1', transform: 'scale(1)'}),
    animate(`0.3s ${Easing.easeIncubic}`, style({opacity: '0', transform: 'scale(1.05)'})
 )])
]);

export const fadeList = (selector: string) => trigger('fadeList', [
  transition(':increment', [
    query(`${selector}:enter`, [
      style({  opacity: 0, transform: 'scale(0.95)' }),
      stagger(30, [animate(`0.3s ${Easing.easeOutcubic}`, style({opacity: '1', transform: 'scale(1)'}))])
    ], { optional: true }),
  ]),
  transition(':decrement', [
    query(`${selector}:leave`, [
      style({  opacity: 1, transform: 'scale(1)' }),
      stagger(-30, [animate(`0.3s ${Easing.easeOutcubic}`, style({opacity: 0, transform: 'scale(0.95)'}))])
    ], { optional: true }),
  ]),
  transition(':enter', [
    query(selector, [
      style({  opacity: 0, transform: 'scale(0.95)' }),
      stagger(30, [animate(`0.3s ${Easing.easeOutcubic}`, style({opacity: '1', transform: 'scale(1)'}))])
    ], { optional: true }),
  ]),
  transition(':leave', [
    style({opacity: '1', transform: 'scale(1)'}),
    animate(`0.3s ${Easing.easeIncubic}`, style({opacity: '0', transform: 'scale(0.95)'})
  )])
]);
