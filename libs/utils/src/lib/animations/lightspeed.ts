import { animate, animation, keyframes, style, useAnimation, transition, trigger } from '@angular/animations';

/** 
 * enter animation 
 * @example trigger('lightSpeedIn', [transition('* => *', useAnimation(lightSpeedIn))]) 
*/  
export const lightSpeedIn = animation(
    animate(
        '{{ timing }}s {{ delay }}s',
        keyframes([
            style({
                opacity: 0,
                transform: 'translate3d(100%, 0, 0) skewX(-30deg)', //translate3d() CSS function repositions an element in 3D space.
                offset: 0,
            }),
            style({
                opacity: 1,
                transform: 'translate3d(0, 0, 0) skewX(0)', //skewX() CSS function defines a transformation that skews an element in the horizontal direction on the 2D plane.
                offset: 1,
            }),
        ])
    ),
    {
        params: { timing: 1, delay: 0 },
    }
);

/** 
 * leave animation 
 * @example trigger('lightSpeedOut', [transition('* => *', useAnimation(lightSpeedOut))]) 
 */ 
export const lightSpeedOut = animation(
    animate(
        '{{ timing }}s {{ delay }}s ease-out',
        keyframes([
            style({
                opacity: 1,
                offset: 0,
            }),
            style({
                opacity: 0,
                transform: 'translate3d(100%, 0, 0) skewX(30deg)',
                offset: 1,
            }),
        ])
    ),
    {
        params: { timing: 1, delay: 0 },
    }
);

export const lightSpeedInAnim = trigger('lightSpeedIn', [transition(':enter', useAnimation(lightSpeedIn))]);
export const lightSpeedOutAnim = trigger('lightSpeedOut', [transition(':leave', useAnimation(lightSpeedOut))]);