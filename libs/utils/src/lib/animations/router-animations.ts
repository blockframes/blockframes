import {transition, trigger, query, style, animate, group, animateChild, stagger, sequence } from '@angular/animations';
import { Easing } from './animation-easing';

const listToList = [
    'notifications <=> title-list',
    'notifications <=> wishlist',
    'notifications <=> organization-list',
    'notifications <=> event-list',
    'wishlist <=> title-list',
    'wishlist <=> organization-list',
    'wishlist <=> event-list',
    'title-list <=> organization-list',
    'title-list <=> event-list',
    'organization-list <=> event-list',
].join(',');

// List <=> View
const listToView = [
    'notifications <=> title-view',
    'notifications <=> organization-view',
    'notifications <=> event-view',
    'wishlist <=> title-view',
    'wishlist <=> organization-view',
    'wishlist <=> event-view',
    'title-list <=> title-view',
    'title-list <=> organization-view',
    'organization-list <=> organization-view',
    // View <=> View
    'title-view <=> organization-view',
].join(', ')


/** Prepare page before leaving/entering (use absolute to get out of the page flow) */
const prepare = [
    style({ position: 'relative' }),
    query(':enter, :leave', [
        style({
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
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
    transition('* => home', [
        ...prepare,
        query(':enter', [ style({ transform: 'translateY(100vh)', opacity: 1 }) ]),
        group([
            query(':leave', [ animate('200ms ease-out', style({ opacity: 0 })) ], { optional: true }),
            query(':enter', [ animate(`600ms ${Easing.easeOutExpo}`, style({ transform: 'translateY(0)', opacity: 1 })) ])
        ]),
    ]),
    // List <=> List
    transition(listToList, [
        ...prepare,
        query(':enter', [ style({  left: '-100%', opacity: 0}) ]),
        group([
            query(':leave', [
              animate('200ms ease-out', style({  left: '50%', opacity: 0 }))
            ], { optional: true }),
            query(':enter', [
              animate('300ms ease-out', style({  left: '0%', opacity: 1 }))
            ], { optional: true })
        ]),
    ]),
    // List <=> view
    transition(listToView, [
        ...prepare,
        query(':enter', [ style({ opacity: 0 }) ], { optional: true }),
        query(':leave', animateChild(), { optional: true }),
        query(':enter', animateChild(), { optional: true }),
    ]),
]);
