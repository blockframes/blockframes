import { trigger, transition, style, query, animateChild, group, animate, keyframes} from "@angular/animations";

export const slideInAnimation =
  trigger('slideInAnimation', [
    transition('DeliveryAddChooseStarterPage => DeliveryAddTemplatePickerPage, DeliveryAddTemplatePickerPage => DeliveryAddSettingsPage', [
      style({ position: 'relative' }),
      query(':enter, :leave', [
        style({
          position: 'absolute',
          // top: 0,
          // left: 0,
          width: '100%'
        })
      ]),
      query(':enter', [
        style({ left: '100%'})
      ]),
      query(':leave', animateChild()),
      group([
        query(':leave', [
          animate('300ms ease-out', style({ left: '-100%'}))
        ]),
        query(':enter', [
          animate('300ms ease-out', style({ left: '0%'}))
        ])
      ]),
      query(':enter', animateChild()),
    ]),

    transition('DeliveryAddSettingsPage => DeliveryAddTemplatePickerPage, DeliveryAddTemplatePickerPage => DeliveryAddChooseStarterPage', [
      style({ position: 'relative' }),
      query(':enter, :leave', [
        style({
          position: 'absolute',
          // top: 0,
          // left: 0,
          width: '100%'
        })
      ]),
      query(':enter', [
        style({ left: '-100%'})
      ]),
      query(':leave', animateChild()),
      group([
        query(':leave', [
          animate('300ms ease-out', style({ left: '100%'}))
        ]),
        query(':enter', [
          animate('300ms ease-out', style({ left: '0%'}))
        ])
      ]),
      query(':enter', animateChild()),
    ]),

      transition('DeliveryAddFindMoviePage => DeliveryAddChooseStarterPage', [
        style({ position: 'relative' }),
        query(':enter, :leave', [
          style({
            position: 'absolute',
            // top: 0,
            // left: 0,
            width: '100%'
          })
        ]),
        query(':enter', [
          style({ left: '100%'})
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

      transition('DeliveryAddChooseStarterPage => DeliveryAddFindMoviePage, DeliveryAddSettingsPage => DeliveryEditablePage', [
        style({ position: 'relative' }),
        query(':enter, :leave', [
          style({
            position: 'absolute',
            // top: 0,
            // left: 0,
            width: '100%'
          })
        ]),
        query(':enter', [
          style({ left: '100%'})
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