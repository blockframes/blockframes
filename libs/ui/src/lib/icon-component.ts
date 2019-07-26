import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Injectable } from '@angular/core';

const ICONS_SVG = [
  {
    name: 'accepted',
    url: 'assets/icons/accepted.svg'
  },
  {
    name: 'adjustableWrench',
    url: 'assets/icons/adjustableWrench.svg'
    name: 'signatory',
    url: 'assets/icons/signatory.svg'
  },
  {
    name: 'acceptMember',
    url: 'assets/icons/acceptMember.svg'
  },
  {
    name: 'refuseMember',
    url: 'assets/icons/refuseMember.svg'
  },
  },
  {
    name: 'cross',
    url: 'assets/icons/cross.svg'
  },
  {
    name: 'save',
    url: 'assets/icons/save.svg'
  },
  {
    name: 'edit',
    url: 'assets/icons/edit.svg'
  },
  {
    name: 'changePass',
    url: 'assets/icons/changePass.svg'
  },
  {
    name: 'magicWand',
    url: 'assets/icons/magicWand.svg'
  },
  {
    name: 'magnifyingGlass',
    url: 'assets/icons/magnifyingGlass.svg'
  },
  {
    name: 'arrow',
    url: 'assets/icons/arrow.svg'
  },
  {
    name: 'add',
    url: 'assets/icons/add.svg'
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
    name: 'disabled',
    url: 'assets/icons/disabled.svg'
  },
  {
    name: 'enabled',
    url: 'assets/icons/removeRedEye.svg'
  },
  {
    name: 'filter',
    url: 'assets/icons/filter.svg'
  },
  {
    name: 'home_of_scripts',
    url: 'assets/apps/home_of_scripts.svg'
  },
  {
    name: 'bigger_boat',
    url: 'assets/apps/home_of_scripts.svg'
  },
  {
    name: 'libraryBooks',
    url: 'assets/icons/libraryBooks.svg'
  },
  {
    name: 'logical',
    url: 'assets/icons/logical.svg'
  },
  {
    name: 'logoBF',
    url: 'assets/logo/logoBF.svg'
  },
  {
    name: 'logoBFblue',
    url: 'assets/logo/logoBFblue.svg'
  },
  {
    name: 'media_delivering',
    url: 'assets/apps/media_delivering.svg'
  },
  {
    name: 'media_financiers',
    url: 'assets/apps/media_financiers.svg'
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
    name: 'notPayed',
    url: 'assets/icons/notPayed.svg'
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
    name: 'pictureAsPdf',
    url: 'assets/icons/pictureAsPdf.svg'
  },
  {
    name: 'refused',
    url: 'assets/icons/refused.svg'
  },
  {
    name: 'signed',
    url: 'assets/icons/signed.svg'
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
  },
  {
    name: 'circled_upload',
    url: 'assets/circled-icons/upload.svg'
  },
  {
    name: 'circled_blacklist',
    url: 'assets/circled-icons/blacklist.svg'
  },
  {
    name: 'circled_delete',
    url: 'assets/circled-icons/delete.svg'
  },
  {
    name: 'keyIcon',
    url: 'assets/icons/keyIcon.svg'
  }
];

/**
 * Load the icons and make sure they are provided everywhere.
 * To be used at the root of every app.
 *
 * Invoke the icons with:
 *  <mat-icon svgIcon="notPayed"></mat-icon>
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
