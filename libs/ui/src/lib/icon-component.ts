import { MatIconRegistry } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { Injectable } from '@angular/core';

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
    this.matIconRegistry.addSvgIcon(
      'accepted',
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/accepted.svg')
    );
    this.matIconRegistry.addSvgIcon(
      'available',
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/available.svg')
    );
    this.matIconRegistry.addSvgIcon(
      'delivered',
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/delivered.svg')
    );
    this.matIconRegistry.addSvgIcon(
      'delivery',
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/apps/delivery.svg')
    );
    this.matIconRegistry.addSvgIcon(
      'disabled',
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/disabled.svg')
    );
    this.matIconRegistry.addSvgIcon(
      'enabled',
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/remove_red_eye.svg')
    );
    this.matIconRegistry.addSvgIcon(
      'filter',
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/filter.svg')
    );
    this.matIconRegistry.addSvgIcon(
      'library_books',
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/library_books.svg')
    );
    this.matIconRegistry.addSvgIcon(
      'order',
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/order.svg')
    );
    this.matIconRegistry.addSvgIcon(
      'not_payed',
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/not-payed.svg')
    );
    this.matIconRegistry.addSvgIcon(
      'payed',
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/payed.svg')
    );
    this.matIconRegistry.addSvgIcon(
      'pending',
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/pending.svg')
    );
    this.matIconRegistry.addSvgIcon(
      'picture_as_pdf',
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/picture_as_pdf.svg')
    );
    this.matIconRegistry.addSvgIcon(
      'refused',
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/refused.svg')
    );
  }
}
