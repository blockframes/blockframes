import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Injectable } from '@angular/core';

const ICONS_SVG = [
  {
    name: 'trash',
    url: 'assets/icons/trash.svg'
  },
  {
    name: 'accepted',
    url: 'assets/icons/accepted.svg'
  },
  {
    name: 'adjustableWrench',
    url: 'assets/icons/adjustableWrench.svg'
  },
  {
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
    name: 'darkMagnifyingGlass',
    url: 'assets/icons/dark-MagnifyingGlass.svg'
  },
  {
    name: 'darkAdjustableWrench',
    url: 'assets/icons/dark-adjustableWrench.svg'
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
    name: 'logoBFdark',
    url: 'assets/logo/logoBFdark.svg'
  },
  {
    name: 'logoBFlight',
    url: 'assets/logo/logoBFlight.svg'
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
  },
  {
    name: 'template',
    url: 'assets/icons/template.svg'
  },
  {
    name: 'delete',
    url: 'assets/icons/trash.svg'
  },
  {
    name: 'signature',
    url: 'assets/icons/signature.svg'
  },
  {
    name: 'pdf',
    url: 'assets/icons/pdf.svg'
  },
  {
    name: 'listMaterial',
    url: 'assets/icons/listMaterial.svg'
  },
  {
    name: 'blank',
    url: 'assets/icons/blank.svg'
  },
  {
    name: 'ordered',
    url: 'assets/icons/ordered.svg'
  },
  {
    name: 'paid',
    url: 'assets/icons/paid.svg'
  },
  {
    name: 'arrowOpen',
    url: 'assets/icons/icon_40px_ArrowOpen.svg'
  },
  {
    name: 'chevronLeft',
    url: 'assets/icons/icon_40px_ChevronLeft.svg'
  },
  {
    name: 'arrowRight',
    url: 'assets/icons/icon_32px_ArrowRight.svg'
  },
  {
    name: 'movie-financing',
    url: 'assets/apps/movie-financing.svg'
  },
  {
    name: 'stories-and-more',
    url: 'assets/apps/stories-and-more.svg'
  },
  {
    name: 'delivery',
    url: 'assets/apps/delivery.svg'
  },
  {
    name: 'catalog-marketplace',
    url: 'assets/apps/catalog-marketplace.svg'
  },
  {
    name: 'catalog-dashboard',
    url: 'assets/apps/catalog-dashboard.svg'
  },
  {
    name: 'group',
    url: 'assets/icons/group.svg'
  },
  {
    name: 'profile',
    url: 'assets/icons/profile.svg'
  },
  {
    name: 'logout',
    url: 'assets/icons/logOut.svg'
  },
  {
    name: 'building',
    url: 'assets/icons/building.svg'
  },
  {
    name: 'wallet',
    url: 'assets/icons/wallet.svg'
  },
  {
    name: 'heart',
    url: 'assets/icons/heart.svg'
  },
  {
    name: 'heart_filled',
    url: 'assets/icons/heart_filled.svg'
  },
  { name: 'star', url: 'assets/icons/star.svg' }
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
  constructor(private matIconRegistry: MatIconRegistry, private domSanitizer: DomSanitizer) {
    ICONS_SVG.forEach(({ name, url }) => {
      this.matIconRegistry.addSvgIcon(name, this.domSanitizer.bypassSecurityTrustResourceUrl(url));
    });
  }
}
