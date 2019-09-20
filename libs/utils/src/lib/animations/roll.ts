import { animation, animate, keyframes, style, trigger, transition, useAnimation } from '@angular/animations';

/** 
 * enter animation 
 * @example trigger('rollIn', [transition('* => *', useAnimation(rollIn))]) 
 */  
export const rollIn = animation(
  [
    animate(
      '{{ timing }}s {{ delay }}s',
      keyframes([
        style({
          opacity: 0,
          transform: 'translate3d(-100%, 0, 0) rotate3d(0, 0, 1, -120deg)',
          offset: 0,
        }),
        style({
          opacity: 1,
          transform: 'none',
          offset: 1,
        }),
      ])
    ),
  ],
  {
    params: { timing: 1, delay: 0 },
  }
);
  
/** 
 * leave animation 
 * @example trigger('rollOut', [transition('* => *', useAnimation(rollOut))]) 
 */  
export const rollOut = animation(
  [
    animate(
      '{{ timing }}s {{ delay }}s',
      keyframes([
        style({
        opacity: 1,
        offset: 0,
        }),
        style({
        opacity: 0,
        transform: 'translate3d(100%, 0, 0) rotate3d(0, 0, 1, 120deg)',
        offset: 1,
        }),
      ])
    ),
  ],
  {
      params: { timing: 1, delay: 0 },
  }
);

export const rollInAnim = trigger('rollIn', [transition(':enter', useAnimation(rollIn))]);
export const rollOutAnim = trigger('rollOut', [transition(':leave', useAnimation(rollOut))]);