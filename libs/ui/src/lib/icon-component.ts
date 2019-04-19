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
      'refused',
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/refused.svg')
    );
  }
}
