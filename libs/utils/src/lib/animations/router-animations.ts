import {transition, trigger, query, style, animate, group, animateChild, stagger } from '@angular/animations';


export const slideAnimation =
trigger('slideAnimation', [
    transition('DeliveryEditablePage => *', [
        query(':enter, :leave', 
            style({ position: 'fixed', width: '100%' }), 
            { optional: true }),        
        group([
            query(':enter',[
                style({ transform: 'translateX(-100%)' }),
                animate('0.5s ease-in-out', 
                style({ transform: 'translateX(0%)' }))
            ], { optional: true }),
            query(':leave', [
                style({ transform:   'translateX(0%)'}),
                animate('0.5s ease-in-out', 
                style({ transform: 'translateX(100%)' }))
            ], { optional: true }),
        ])
    ]),

    transition('DeliveryInformationsEditablePage => *', [
        query(':enter, :leave', 
            style({ position: 'fixed',  width: '100%' }), 
            { optional: true }),
        group([
            query(':enter', [
                style({ transform: 'translateX(100%)' }), 
                animate('0.5s ease-in-out', 
                style({ transform: 'translateX(0%)' }))
            ], { optional: true }),
            query(':leave', [
                style({ transform: 'translateX(0%)' }),
                animate('0.5s ease-in-out', 
                style({ transform: 'translateX(-100%)' }))
                ], { optional: true }),
        ])
    ]),

    transition('DeliveryStakeholdersEditablePage => DeliveryEditablePage', [
        query(':enter, :leave', 
            style({ position: 'fixed', width: '100%' }), 
            { optional: true }),
        group([
            query(':enter', [
                style({ transform: 'translateX(100%)' }),
                animate('0.5s ease-in-out', 
                style({ transform: 'translateX(0%)' }))
            ], { optional: true }),
            query(':leave', [
                style({ transform: 'translateX(0%)' }),
                animate('0.5s ease-in-out', 
                style({ transform: 'translateX(-100%)' }))
            ], { optional: true }),
        ])
    ]),
    
    transition('DeliveryStakeholdersEditablePage => DeliveryInformationsEditablePage', [
        query(':enter, :leave', 
            style({ position: 'fixed', width: '100%' }), 
            { optional: true }),
        group([
            query(':enter', [
                style({ transform: 'translateX(-100%)' }),
                animate('0.5s ease-in-out', 
                style({ transform: 'translateX(0%)' }))
            ], { optional: true }),
            query(':leave', [
                style({ transform: 'translateX(0%)' }),
                animate('0.5s ease-in-out', 
                style({ transform: 'translateX(100%)' }))
            ], { optional: true }),
        ])
    ]),
]);

export const fadeAnimation =
trigger('fadeAnimation', [
    transition('* <=> *', [
        query(':enter, :leave', 
        style({ position: 'fixed', width: '100%' }), 
        { optional: true }),
        group([
            query(':enter',[
                style({ opacity: '0' }),
                animate('0.5s ease-in-out', 
                style({opacity: '1'})  
             ) ], { optional: true }),
            query(':leave', [
                style({ opacity:   '1'}),
                animate('0.5s ease-in-out',
                style({opacity: '0'})  
            )], { optional: true }),
        ])
    ])]);
