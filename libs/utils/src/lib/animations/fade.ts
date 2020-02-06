import {transition, trigger, style, animate } from '@angular/animations';
import { Easing } from './animation-easing';

export const fade = trigger('fade', [
  transition(':enter', [
    style({ opacity: '0', transform: 'scale(0.95)' }),
    animate(`0.3s ${Easing.easeOutcubic}`, style({opacity: '1', transform: 'scale(1)'})
 )]),
  transition(':leave', [
    style({opacity: '1', transform: 'scale(1)'}),
    animate(`0.3s ${Easing.easeIncubic}`, style({opacity: '0', transform: 'scale(0.95)'})
 )])
]);