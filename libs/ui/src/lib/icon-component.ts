import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Injectable } from '@angular/core';

const icons = [
  { name: 'accept', url: 'assets/icons/accept.svg' },
  {
    name: 'accept_member',
    url: 'assets/icons/accept_member.svg'
  },
  { name: 'access_time', url: 'assets/icons/access_time.svg' },
  { name: 'add', url: 'assets/icons/add.svg' },
  { name: 'applications', url: 'assets/apps/applications.svg' },
  {
    name: 'archipel_content',
    url: 'assets/icons/archipel_content.svg'
  },
  {
    name: 'archipel_content_fill',
    url: 'assets/icons/archipel_content_fill.svg'
  },
  { name: 'archive', url: 'assets/icons/archive.svg' },
  { name: 'arrow_back', url: 'assets/icons/arrow_back.svg' },
  { name: 'arrow_closed', url: 'assets/icons/arrow_closed.svg' },
  {
    name: 'arrow_downward',
    url: 'assets/icons/arrow_downward.svg'
  },
  {
    name: 'arrow_forward',
    url: 'assets/icons/arrow_forward.svg'
  },
  { name: 'arrow_left', url: 'assets/icons/arrow_left.svg' },
  { name: 'arrow_open', url: 'assets/icons/arrow_open.svg' },
  { name: 'arrow_right', url: 'assets/icons/arrow_right.svg' },
  { name: 'arrow_upward', url: 'assets/icons/arrow_upward.svg' },
  { name: 'basket', url: 'assets/icons/basket.svg' },
  { name: 'bell', url: 'assets/icons/bell.svg' },
  { name: 'blank', url: 'assets/icons/blank.svg' },
  { name: 'blind_eye', url: 'assets/icons/blind_eye.svg' },
  { name: 'blog', url: 'assets/icons/blog.svg' },
  { name: 'building', url: 'assets/icons/building.svg' },
  { name: 'calendar', url: 'assets/icons/calendar.svg' },
  { name: 'certificate', url: 'assets/icons/certificate.svg' },
  { name: 'check', url: 'assets/icons/check.svg' },
  {
    name: 'check_box_indeterminate',
    url: 'assets/icons/check_box_indeterminate.svg'
  },
  {
    name: 'check_box_marked',
    url: 'assets/icons/check_box_marked.svg'
  },
  {
    name: 'checkbox_outline',
    url: 'assets/icons/checkbox_outline.svg'
  },
  {
    name: 'chevron_bottom',
    url: 'assets/icons/chevron_bottom.svg'
  },
  { name: 'chevron_left', url: 'assets/icons/chevron_left.svg' },
  {
    name: 'chevron_right',
    url: 'assets/icons/chevron_right.svg'
  },
  { name: 'chevron_top', url: 'assets/icons/chevron_top.svg' },
  { name: 'clear_all', url: 'assets/icons/clear_all.svg' },
  { name: 'close', url: 'assets/icons/close.svg' },
  { name: 'comment', url: 'assets/icons/comment.svg' },
  { name: 'create_movie', url: 'assets/icons/create_movie.svg' },
  { name: 'cross', url: 'assets/icons/cross.svg' },
  { name: 'dashboard', url: 'assets/icons/dashboard.svg' },
  { name: 'document', url: 'assets/icons/document.svg' },
  {
    name: 'document_signed',
    url: 'assets/icons/document_signed.svg'
  },
  {
    name: 'document_to_signed',
    url: 'assets/icons/document_to_signed.svg'
  },
  { name: 'dollar', url: 'assets/icons/dollar.svg' },
  { name: 'dot_menu', url: 'assets/icons/dot_menu.svg' },
  { name: 'download', url: 'assets/icons/download.svg' },
  { name: 'eye', url: 'assets/icons/eye.svg' },
  { name: 'facebook', url: 'assets/icons/facebook.svg' },
  { name: 'film', url: 'assets/icons/film.svg' },
  { name: 'filter_list', url: 'assets/icons/filter_list.svg' },
  { name: 'first_page', url: 'assets/icons/first_page.svg' },
  { name: 'floppy', url: 'assets/icons/floppy.svg' },
  { name: 'grid', url: 'assets/icons/grid.svg' },
  { name: 'group', url: 'assets/icons/group.svg' },
  { name: 'heart_fill', url: 'assets/icons/heart_fill.svg' },
  {
    name: 'heart_outline',
    url: 'assets/icons/heart_outline.svg'
  },
  { name: 'home', url: 'assets/icons/home.svg' },
  { name: 'import', url: 'assets/icons/import.svg' },
  { name: 'info', url: 'assets/icons/info.svg' },
  { name: 'instagram', url: 'assets/icons/instagram.svg' },
  { name: 'key', url: 'assets/icons/key.svg' },
  { name: 'last_page', url: 'assets/icons/last_page.svg' },
  { name: 'linkedin', url: 'assets/icons/linkedin.svg' },
  { name: 'list', url: 'assets/icons/list.svg' },
  {
    name: 'list_material',
    url: 'assets/icons/list_material.svg'
  },
  { name: 'log_out', url: 'assets/icons/log_out.svg' },
  {
    name: 'logo_archipel_content',
    url: 'assets/icons/logo_archipel_content.svg'
  },
  {
    name: 'logo_archipel_content_fill',
    url: 'assets/icons/logo_archipel_content_fill.svg'
  },
  {
    name: 'logo_blockframes',
    url: 'assets/icons/logo_blockframes.svg'
  },
  {
    name: 'logo_blockframes_fill',
    url: 'assets/icons/logo_blockframes_fill.svg'
  },
  {
    name: 'logo_media_delivery',
    url: 'assets/icons/logo_media_delivery.svg'
  },
  {
    name: 'logo_media_delivery_fill',
    url: 'assets/icons/logo_media_delivery_fill.svg'
  },
  {
    name: 'logo_media_financiers',
    url: 'assets/icons/logo_media_financiers.svg'
  },
  {
    name: 'logo_media_financiers_fill',
    url: 'assets/icons/logo_media_financiers_fill.svg'
  },
  {
    name: 'logo_storiesand_more',
    url: 'assets/icons/logo_storiesand_more.svg'
  },
  {
    name: 'logo_storiesand_more_fill',
    url: 'assets/icons/logo_storiesand_more_fill.svg'
  },
  { name: 'logout',url: 'assets/icons/log_out.svg' },
  {
    name: 'magnifying_glasses',
    url: 'assets/icons/magnifying_glasses.svg'
  },
  { name: 'mail', url: 'assets/icons/mail.svg' },
  { name: 'map_marker', url: 'assets/icons/map_marker.svg' },
  {
    name: 'media_delivery',
    url: 'assets/icons/media_delivery.svg'
  },
  {
    name: 'media_delivery_fill',
    url: 'assets/icons/media_delivery_fill.svg'
  },
  {
    name: 'media_financiers',
    url: 'assets/icons/media_financiers.svg'
  },
  {
    name: 'media_financiers_fill',
    url: 'assets/icons/media_financiers_fill.svg'
  },
  { name: 'monetization', url: 'assets/icons/monetization.svg' },
  { name: 'more_vert', url: 'assets/icons/more_vert.svg' },
  {
    name: 'mouse_pointer',
    url: 'assets/icons/mouse_pointer.svg'
  },
  { name: 'open_to', url: 'assets/icons/open_to.svg' },
  { name: 'pdf', url: 'assets/icons/pdf.svg' },
  { name: 'padlock', url: 'assets/icons/padlock.svg' },
  { name: 'paid', url: 'assets/icons/paid.svg' },
  { name: 'pencil', url: 'assets/icons/pencil.svg' },
  { name: 'percent', url: 'assets/icons/percent.svg' },
  { name: 'picture', url: 'assets/icons/picture.svg' },
  { name: 'play', url: 'assets/icons/play.svg'},
  { name: 'profile', url: 'assets/icons/profile.svg' },
  {
    name: 'radio_box_blank',
    url: 'assets/icons/radio_box_blank.svg'
  },
  {
    name: 'radio_box_marked',
    url: 'assets/icons/radio_box_marked.svg'
  },
  { name: 'refresh', url: 'assets/icons/refresh.svg' },
  { name: 'refuse', url: 'assets/icons/refuse.svg' },
  { name: 'remove_member', url: 'assets/icons/remove_member.svg' },
  { name: 'review', url: 'assets/icons/review.svg' },
  { name: 'sales', url: 'assets/icons/sales.svg' },
  { name: 'schedules', url: 'assets/icons/schedules.svg' },
  { name: 'search_table', url: 'assets/icons/search_table.svg' },
  { name: 'send', url: 'assets/icons/send.svg' },
  { name: 'settings', url: 'assets/icons/settings.svg' },
  { name: 'share', url: 'assets/icons/share.svg' },
  {
    name: 'shopping_cart',
    url: 'assets/icons/shopping_cart.svg'
  },
  { name: 'sign_ok', url: 'assets/icons/sign_ok.svg' },
  {
    name: 'specific_delivery_list',
    url: 'assets/icons/specific_delivery_list.svg'
  },
  { name: 'spinner', url: 'assets/icons/spinner.svg' },
  { name: 'star', url: 'assets/icons/star.svg' },
  { name: 'star_fill', url: 'assets/icons/star_fill.svg' },
  {
    name: 'stories_and_more',
    url: 'assets/icons/stories_and_more.svg'
  },
  {
    name: 'stories_and_more_fill',
    url: 'assets/icons/stories_and_more_fill.svg'
  },
  { name: 'template', url: 'assets/icons/template.svg' },
  { name: 'text_area', url: 'assets/icons/text_area.svg' },
  { name: 'thumb_down', url: 'assets/icons/thumb_down.svg' },
  { name: 'translate', url: 'assets/icons/translate.svg' },
  { name: 'trash', url: 'assets/icons/trash.svg' },
  { name: 'twitter', url: 'assets/icons/twitter.svg' },
  { name: 'update', url: 'assets/icons/update.svg' },
  {
    name: 'validation_required',
    url: 'assets/icons/validation_required.svg'
  },
  {
    name: 'video_library',
    url: 'assets/icons/video_library.svg'
  },
  { name: 'wallet', url: 'assets/icons/wallet.svg' },
  { name: 'world', url: 'assets/icons/world.svg' },
  { name: 'wrench', url: 'assets/icons/wrench.svg' },
] as const;

export type IconSvg = typeof icons[number]['name'];

// const ICONS_SVG = [
//   {
//     name: 'trash',
//     url: 'assets/icons/trash.svg'
//   },
//   {
//     name: 'accepted',
//     url: 'assets/icons/accepted.svg'
//   },
//   {
//     name: 'adjustableWrench',
//     url: 'assets/icons/adjustableWrench.svg'
//   },
//   {
//     name: 'signatory',
//     url: 'assets/icons/signatory.svg'
//   },
//   {
//     name: 'acceptMember',
//     url: 'assets/icons/acceptMember.svg'
//   },
//   {
//     name: 'refuseMember',
//     url: 'assets/icons/refuseMember.svg'
//   },
//   {
//     name: 'save',
//     url: 'assets/icons/save.svg'
//   },
//   {
//     name: 'edit',
//     url: 'assets/icons/edit.svg'
//   },
//   {
//     name: 'changePass',
//     url: 'assets/icons/changePass.svg'
//   },
//   {
//     name: 'magicWand',
//     url: 'assets/icons/magicWand.svg'
//   },
//   {
//     name: 'magnifyingGlass',
//     url: 'assets/icons/magnifyingGlass.svg'
//   },
//   {
//     name: 'darkMagnifyingGlass',
//     url: 'assets/icons/dark-MagnifyingGlass.svg'
//   },
//   {
//     name: 'darkAdjustableWrench',
//     url: 'assets/icons/dark-adjustableWrench.svg'
//   },
//   {
//     name: 'arrow',
//     url: 'assets/icons/arrow.svg'
//   },
//   {
//     name: 'add',
//     url: 'assets/icons/add.svg'
//   },
//   {
//     name: 'applications',
//     url: 'assets/apps/applications.svg'
//   },
//   {
//     name: 'available',
//     url: 'assets/icons/available.svg'
//   },
//   {
//     name: 'delivered',
//     url: 'assets/icons/delivered.svg'
//   },
//   {
//     name: 'disabled',
//     url: 'assets/icons/disabled.svg'
//   },
//   {
//     name: 'enabled',
//     url: 'assets/icons/removeRedEye.svg'
//   },
//   {
//     name: 'filter',
//     url: 'assets/icons/filter.svg'
//   },
//   {
//     name: 'home_of_scripts',
//     url: 'assets/apps/home_of_scripts.svg'
//   },
//   {
//     name: 'bigger_boat',
//     url: 'assets/apps/home_of_scripts.svg'
//   },
//   {
//     name: 'libraryBooks',
//     url: 'assets/icons/libraryBooks.svg'
//   },
//   {
//     name: 'logical',
//     url: 'assets/icons/logical.svg'
//   },
//   {
//     name: 'logoBFdark',
//     url: 'assets/logo/logoBFdark.svg'
//   },
//   {
//     name: 'logoBFlight',
//     url: 'assets/logo/logoBFlight.svg'
//   },
//   {
//     name: 'media_delivering',
//     url: 'assets/apps/media_delivering.svg'
//   },
//   {
//     name: 'media_financiers',
//     url: 'assets/apps/media_financiers.svg'
//   },
//   {
//     name: 'moviefinancing',
//     url: 'assets/apps/moviefinancing.svg'
//   },
//   {
//     name: 'notifications',
//     url: 'assets/icons/notifications.svg'
//   },
//   {
//     name: 'order',
//     url: 'assets/icons/order.svg'
//   },
//   {
//     name: 'notPayed',
//     url: 'assets/icons/notPayed.svg'
//   },
//   {
//     name: 'payed',
//     url: 'assets/icons/payed.svg'
//   },
//   {
//     name: 'pending',
//     url: 'assets/icons/pending.svg'
//   },
//   {
//     name: 'pictureAsPdf',
//     url: 'assets/icons/pictureAsPdf.svg'
//   },
//   {
//     name: 'refused',
//     url: 'assets/icons/refused.svg'
//   },
//   {
//     name: 'signed',
//     url: 'assets/icons/signed.svg'
//   },
//   {
//     name: 'circled_message',
//     url: 'assets/circled-icons/message.svg'
//   },
//   {
//     name: 'circled_payment_ok',
//     url: 'assets/circled-icons/paymentOK.svg'
//   },
//   {
//     name: 'circled_scenario',
//     url: 'assets/circled-icons/scenario.svg'
//   },
//   {
//     name: 'circled_view',
//     url: 'assets/circled-icons/view.svg'
//   },
//   {
//     name: 'circled_upload',
//     url: 'assets/circled-icons/upload.svg'
//   },
//   {
//     name: 'circled_blacklist',
//     url: 'assets/circled-icons/blacklist.svg'
//   },
//   {
//     name: 'circled_delete',
//     url: 'assets/circled-icons/delete.svg'
//   },
//   {
//     name: 'keyIcon',
//     url: 'assets/icons/keyIcon.svg'
//   },
//   {
//     name: 'template',
//     url: 'assets/icons/template.svg'
//   },
//   {
//     name: 'delete',
//     url: 'assets/icons/trash.svg'
//   },
//   {
//     name: 'signature',
//     url: 'assets/icons/signature.svg'
//   },
//   {
//     name: 'pdf',
//     url: 'assets/icons/pdf.svg'
//   },
//   {
//     name: 'listMaterial',
//     url: 'assets/icons/listMaterial.svg'
//   },
//   {
//     name: 'blank',
//     url: 'assets/icons/blank.svg'
//   },
//   {
//     name: 'ordered',
//     url: 'assets/icons/ordered.svg'
//   },
//   {
//     name: 'paid',
//     url: 'assets/icons/paid.svg'
//   },
//   {
//     name: 'arrowOpen',
//     url: 'assets/icons/icon_40px_ArrowOpen.svg'
//   },
//   {
//     name: 'chevronLeft',
//     url: 'assets/icons/icon_40px_ChevronLeft.svg'
//   },
//   {
//     name: 'arrowRight',
//     url: 'assets/icons/icon_32px_ArrowRight.svg'
//   },
//   {
//     name: 'movie-financing',
//     url: 'assets/apps/movie-financing.svg'
//   },
//   {
//     name: 'stories-and-more',
//     url: 'assets/apps/stories-and-more.svg'
//   },
//   {
//     name: 'delivery',
//     url: 'assets/apps/delivery.svg'
//   },
//   {
//     name: 'catalog-marketplace',
//     url: 'assets/apps/catalog-marketplace.svg'
//   },
//   {
//     name: 'catalog-dashboard',
//     url: 'assets/apps/catalog-dashboard.svg'
//   },
//   {
//     name: 'group',
//     url: 'assets/icons/group.svg'
//   },
//   {
//     name: 'profile',
//     url: 'assets/icons/profile.svg'
//   },
//   {
//     name: 'logout',
//     url: 'assets/icons/logOut.svg'
//   },
//   {
//     name: 'building',
//     url: 'assets/icons/building.svg'
//   },
//   {
//     name: 'heart',
//     url: 'assets/icons/heart.svg'
//   },
//   {
//     name: 'heart_filled',
//     url: 'assets/icons/heart_filled.svg'
//   },
//   {
//     name: 'star',
//     url: 'assets/icons/star.svg'
//   },
//   {
//     name: 'home_sidebar',
//     url: 'assets/icons/home-sidebar.svg'
//   },
//   {
//     name: 'search_sidebar',
//     url: 'assets/icons/search-sidebar.svg'
//   },{
//     name: 'facebook',
//     url: 'assets/icons/facebook.svg'
//   },{
//     name: 'twitter',
//     url: 'assets/icons/twitter.svg'
//   },{
//     name: 'linkedin',
//     url: 'assets/icons/linkedin.svg'
//   },{
//     name: 'instagram',
//     url: 'assets/icons/instagram.svg'
//   },
//   //! From here, it's only the new icons from Mathilde
//   // please organise icon by alphabetical order
//   ////////////////
//   // LIGHT ICON //
//   ////////////////
//   {
//     name: 'certificate',
//     url: 'assets/icons/light/Certificate.svg'
//   },
//   {
//     name: 'cross',
//     url: 'assets/icons/light/Cross.svg'
//   },
//   {
//     name: 'document',
//     url: 'assets/icons/light/Document.svg'
//   },
//   {
//     name: 'floppy',
//     url: 'assets/icons/light/Floppy.svg'
//   },
//   {
//     name: 'import',
//     url: 'assets/icons/light/Import.svg'
//   },
//   {
//     name: 'mapMarker',
//     url: 'assets/icons/light/MapMarker.svg'
//   },
//   ////////////////
//   // DARK ICON //
//   ////////////////
//   {
//     name: 'check',
//     url: 'assets/icons/dark/Check.svg'
//   },
//   {
//     name: 'comment',
//     url: 'assets/icons/dark/Comment.svg'
//   },
//   {
//     name: 'dashboard',
//     url: 'assets/icons/dark/Dashboard.svg'
//   },
//   {
//     name: 'info',
//     url: 'assets/icons/dark/Info.svg'
//   },
//   {
//     name: 'mail',
//     url: 'assets/icons/dark/Mail.svg'
//   },
//   {
//     name: 'refuse',
//     url: 'assets/icons/dark/Refuse.svg'
//   },
//   {
//     name: 'shoppingCart',
//     url: 'assets/icons/dark/ShoppingCart.svg'
//   },
//   {
//     name: 'videoLibrary',
//     url: 'assets/icons/dark/VideoLibrary.svg'
//   },
//   {
//     name: 'wallet',
//     url: 'assets/icons/dark/Wallet.svg'
//   },
// ];

/**
 * Load the icons and make sure they are provided everywhere.
 * To be used at the root of every app.
 *
 * Invoke the icons with:
 *  <mat-icon svgIcon="not_payed"></mat-icon>
 */
@Injectable({ providedIn: 'root' })
export class IconComponent {
  constructor(private matIconRegistry: MatIconRegistry, private domSanitizer: DomSanitizer) {
    icons.forEach(({ name, url }) => {
      this.matIconRegistry.addSvgIcon(name, this.domSanitizer.bypassSecurityTrustResourceUrl(url));
    });
  }
}
