import { animation, trigger, transition, style, animate } from '@angular/animations';


export const easeInCubic = 'cubic-bezier(0.55, 0.055, 0.675, 0.19)';
export const easeOutCubic = 'cubic-bezier(0.215, 0.61, 0.355, 1)';
export const easeInOutCubic = 'cubic-bezier(0.645, 0.045, 0.355, 1)';


export const easeInCirc = 'cubic-bezier(0.6, 0.04, 0.98, 0.335)';
export const easeOutCirc = 'cubic-bezier(0.075, 0.82, 0.165, 1)';
export const easeInOutCirc = 'cubic-bezier(0.785, 0.135, 0.15, 0.86)';


export const enterAnime = `300ms ${easeOutCirc}`;
export const leaveAnime = `300ms ${easeInCirc}`;
export const enterAnimeDelay = `300ms 400ms ${easeOutCirc}`;
export const leaveAnimeDelay = `300ms 400ms ${easeInCirc}`;

// Params
export interface ZoomAnimParams {
    opacity: number;
    transX: string | number;
    transY: string | number;
    scaleX: string | number;
    scaleY: string | number;
  }

  // zoom Style
export const zoomStyle = (style({
    opacity: '{{ opacity }}',
    transform: 'translate({{ transX }}, {{ transY }}) scale({{ scaleX }}, {{ scaleY }})'
  }));

export const zoomEnterParams = { opacity: 0, transX: 0, transY: 0, scaleX: 0.8, scaleY: 0.8 };
export const zoomLeaveParams = { opacity: 0, transX: 0, transY: 0, scaleX: 1, scaleY: 1 };


export const zoom = trigger('zoom', [
transition(':enter', animation([zoomStyle, animate(enterAnime)], { params: zoomEnterParams })),
transition(':leave', animation([animate(leaveAnime, zoomStyle)], { params: zoomLeaveParams })),
]);

export const zoomDelay = trigger('zoomDelay', [
  transition(':enter', animation([zoomStyle, animate(enterAnimeDelay)], { params: zoomEnterParams })),
  transition(':leave', animation([animate(leaveAnime, zoomStyle)], { params: zoomLeaveParams })),
  ]);

export const finalZoom = trigger('finalZoom', [
  transition(':enter', animation([zoomStyle, animate(enterAnimeDelay)], { params: zoomEnterParams })),
  ]);

export const check = trigger('check', [
  transition(':enter', [
    style({ 'stroke-dasharray': 190, 'stroke-dashoffset': 190 }), animate('900ms 300ms cubic-bezier(.9,.24,.02,1.06)'),
  ]),
  transition(':leave', animation([animate(leaveAnime, zoomStyle)], { params: zoomLeaveParams })),
]);

