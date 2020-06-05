import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export const icons = [
  { name: 'accept', url: 'assets/icons/accept.svg' },
  {
    name: 'accept_member',
    url: 'assets/icons/accept_member.svg'
  },
  { name: 'access_time', url: 'assets/icons/access_time.svg' },
  { name: 'add', url: 'assets/icons/add.svg' },
  { name: 'add_member', url: 'assets/icons/add_member.svg' },
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
  { name: 'AUD', url: 'assets/icons/AUD.svg' },
  { name: 'arrow_left', url: 'assets/icons/arrow_left.svg' },
  { name: 'arrow_open', url: 'assets/icons/arrow_open.svg' },
  { name: 'arrow_right', url: 'assets/icons/arrow_right.svg' },
  { name: 'arrow_upward', url: 'assets/icons/arrow_upward.svg' },
  { name: 'attachment', url: 'assets/icons/attachment.svg' },
  { name: 'basket', url: 'assets/icons/basket.svg' },
  { name: 'bell', url: 'assets/icons/bell.svg' },
  { name: 'blank', url: 'assets/icons/blank.svg' },
  { name: 'blind_eye', url: 'assets/icons/blind_eye.svg' },
  { name: 'blog', url: 'assets/icons/blog.svg' },
  { name: 'building', url: 'assets/icons/building.svg' },
  { name: 'CAD', url: 'assets/icons/CAD.svg' },
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
  { name: 'check_circle', url: 'assets/icons/check_circle.svg' },
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
  { name: 'CHF', url: 'assets/icons/CHF.svg' },
  { name: 'clear_all', url: 'assets/icons/clear_all.svg' },
  { name: 'close', url: 'assets/icons/close.svg' },
  { name: 'comment', url: 'assets/icons/comment.svg' },
  { name: 'copy', url: 'assets/icons/copy.svg' },
  { name: 'create_movie', url: 'assets/icons/create_movie.svg' },
  { name: 'cross', url: 'assets/icons/cross.svg' },
  { name: 'CNY', url: 'assets/icons/CNY.svg' },
  { name: 'dark_mode', url: 'assets/icons/dark_mode.svg' },
  { name: 'dashboard', url: 'assets/icons/dashboard.svg' },
  { name: 'document', url: 'assets/icons/document.svg' },
  { name: 'excel', url: 'assets/icons/excel.svg' },
  {
    name: 'document_signed',
    url: 'assets/icons/document_signed.svg'
  },
  {
    name: 'document_to_signed',
    url: 'assets/icons/document_to_signed.svg'
  },
  { name: 'USD', url: 'assets/icons/USD.svg' },
  { name: 'dot_menu', url: 'assets/icons/dot_menu.svg' },
  { name: 'download', url: 'assets/icons/download.svg' },
  { name: 'EUR', url: 'assets/icons/EUR.svg' },
  { name: 'eye', url: 'assets/icons/eye.svg' },
  { name: 'facebook', url: 'assets/icons/facebook.svg' },
  { name: 'film', url: 'assets/icons/film.svg' },
  { name: 'filter_list', url: 'assets/icons/filter_list.svg' },
  { name: 'first_page', url: 'assets/icons/first_page.svg' },
  { name: 'floppy', url: 'assets/icons/floppy.svg' },
  { name: 'GBP', url: 'assets/icons/GBP.svg' },
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
  { name: 'JPY', url: 'assets/icons/JPY.svg' },
  { name: 'ker', url: 'assets/icons/ker.svg' },
  { name: 'key', url: 'assets/icons/key.svg' },
  { name: 'last_page', url: 'assets/icons/last_page.svg' },
  { name: 'launch', url: 'assets/icons/launch.svg' },
  { name: 'light_mode', url: 'assets/icons/light_mode.svg' },
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
  { name: 'logout', url: 'assets/icons/log_out.svg' },
  {
    name: 'magnifying_glasses',
    url: 'assets/icons/magnifying_glasses.svg'
  },
  { name: 'mail', url: 'assets/icons/mail.svg' },
  { name: 'map_marker', url: 'assets/icons/map_marker.svg' },
  { name: 'matching', url: 'assets/icons/matching.svg' },
  { name: 'medal', url: 'assets/icons/medal.svg' },
  {
    name: 'media_financiers',
    url: 'assets/icons/media_financiers.svg'
  },
  {
    name: 'media_financiers_fill',
    url: 'assets/icons/media_financiers_fill.svg'
  },
  { name: 'menu', url: 'assets/icons/menu.svg' },
  { name: 'monetization', url: 'assets/icons/monetization.svg' },
  { name: 'more_horiz', url: 'assets/icons/more_horiz.svg' },
  { name: 'more_vert', url: 'assets/icons/more_vert.svg' },
  {
    name: 'mouse_pointer',
    url: 'assets/icons/mouse_pointer.svg'
  },
  { name: 'NZD', url: 'assets/icons/NZD.svg' },
  { name: 'open_to', url: 'assets/icons/open_to.svg' },
  { name: 'pdf', url: 'assets/icons/PDF.webp' },
  { name: 'padlock', url: 'assets/icons/padlock.svg' },
  { name: 'paid', url: 'assets/icons/paid.svg' },
  { name: 'pencil', url: 'assets/icons/pencil.svg' },
  { name: 'percent', url: 'assets/icons/percent.svg' },
  { name: 'picture', url: 'assets/icons/picture.svg' },
  { name: 'play', url: 'assets/icons/play.svg' },
  { name: 'profile', url: 'assets/icons/profile.svg' },
  {
    name: 'radio_box_blank',
    url: 'assets/icons/radio_box_blank.svg'
  },
  {
    name: 'radio_box_marked',
    url: 'assets/icons/radio_box_marked.svg'
  },
  { name: 'read', url: 'assets/icons/read.svg' },
  { name: 'refresh', url: 'assets/icons/refresh.svg' },
  { name: 'refuse', url: 'assets/icons/refuse.svg' },
  { name: 'remove_member', url: 'assets/icons/remove_member.svg' },
  { name: 'review', url: 'assets/icons/review.svg' },
  { name: 'sales', url: 'assets/icons/sales.svg' },
  { name: 'screening', url: 'assets/icons/screening.svg' },
  { name: 'schedules', url: 'assets/icons/schedules.svg' },
  { name: 'search_table', url: 'assets/icons/search_table.svg' },
  { name: 'SEK', url: 'assets/icons/SEK.svg' },
  { name: 'sellers', url: 'assets/icons/sellers.svg' },
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
  { name: 'trophy', url: 'assets/icons/trophy.svg' },
  { name: 'twitter', url: 'assets/icons/twitter.svg' },
  { name: 'unicorn', url: 'assets/icons/unicorn.svg' },
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


/**
 * Load the icons and make sure they are provided everywhere.
 * To be used at the root of every app.
 *
 * Invoke the icons with:
 *  <mat-icon svgIcon="not_payed"></mat-icon>
 */
@Injectable({ providedIn: 'root' })
export class IconService {
  constructor(
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  init() {
    // Angular Material currently needs a workaround for server side rendering.
    // See https://github.com/angular/components/issues/9728
    if (isPlatformBrowser(this.platformId)) {
      icons.forEach(({ name, url }) => {
        this.matIconRegistry.addSvgIcon(name, this.domSanitizer.bypassSecurityTrustResourceUrl(url));
      });
    } else {
      icons.forEach(({ name }) => {
        this.matIconRegistry.addSvgIconLiteral(name, this.domSanitizer.bypassSecurityTrustHtml('<svg></svg>'));
      })
    }
  }
}
