import { MatIconRegistry } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { Injectable } from '@angular/core';

const ICONS_SVG = [
  {
    name: 'accepted',
    url: 'assets/icons/accepted.svg'
  },
  {
    name: 'applications',
    url: 'assets/apps/applications.svg'
  },
  {
    name: 'available',
    url: 'assets/icons/available.svg'
  },
  {
    name: 'delivered',
    url: 'assets/icons/delivered.svg'
  },
  {
    name: 'delivery',
    url: 'assets/apps/delivery.svg'
  },
  {
    name: 'disabled',
    url: 'assets/icons/disabled.svg'
  },
  {
    name: 'enabled',
    url: 'assets/icons/remove_red_eye.svg'
  },
  {
    name: 'filter',
    url: 'assets/icons/filter.svg'
  },
  {
    name: 'library_books',
    url: 'assets/icons/library_books.svg'
  },
  {
    name: 'moviefinancing',
    url: 'assets/apps/moviefinancing.svg'
  },
  {
    name: 'notifications',
    url: 'assets/icons/notifications.svg'
  },
  {
    name: 'order',
    url: 'assets/icons/order.svg'
  },
  {
    name: 'not_payed',
    url: 'assets/icons/not-payed.svg'
  },
  {
    name: 'payed',
    url: 'assets/icons/payed.svg'
  },
  {
    name: 'pending',
    url: 'assets/icons/pending.svg'
  },
  {
    name: 'picture_as_pdf',
    url: 'assets/icons/picture_as_pdf.svg'
  },
  {
    name: 'refused',
    url: 'assets/icons/refused.svg'
  },
  {
    name: 'circled_message',
    url: 'assets/circled-icons/message.svg'
  },
  {
    name: 'circled_payment_ok',
    url: 'assets/circled-icons/paymentOK.svg'
  },
  {
    name: 'circled_scenario',
    url: 'assets/circled-icons/scenario.svg'
  },
  {
    name: 'circled_view',
    url: 'assets/circled-icons/view.svg'
  }
];

/**
 * Load the icons and make sure they are provided everywhere.
 * To be used at the root of every app.
 *
 * Invoke the icons with:
 *  <mat-icon svgIcon="not_payed"></mat-icon>
 */
@Injectable({ providedIn: 'root' })
export class IconComponent {
  constructor(private matIconRegistry: MatIconRegistry,
              private domSanitizer: DomSanitizer
  ) {
    ICONS_SVG.forEach(({ name, url }) => {
      this.matIconRegistry.addSvgIcon(name, this.domSanitizer.bypassSecurityTrustResourceUrl(url));
    });
  }
}
