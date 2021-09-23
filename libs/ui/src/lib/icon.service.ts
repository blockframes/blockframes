import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export const icons = [
  { name: 'access_time', url: 'assets/icons/access_time.svg' },
  { name: 'account_balance_wallet', url: 'assets/icons/account_balance_wallet.svg' },
  { name: 'account_circle', url: 'assets/icons/account_circle.svg' },
  { name: 'add', url: 'assets/icons/add.svg' },
  { name: 'archive', url: 'assets/icons/archive.svg' },
  { name: 'arrow_back', url: 'assets/icons/arrow_back.svg' },
  { name: 'arrow_downward', url: 'assets/icons/arrow_downward.svg' },
  { name: 'arrow_drop_down', url: 'assets/icons/arrow_drop_down.svg' },
  { name: 'arrow_drop_up', url: 'assets/icons/arrow_drop_up.svg' },
  { name: 'arrow_forward', url: 'assets/icons/arrow_forward.svg' },
  { name: 'arrow_left', url: 'assets/icons/arrow_left.svg' },
  { name: 'arrow_right', url: 'assets/icons/arrow_right.svg' },
  { name: 'arrow_upward', url: 'assets/icons/arrow_upward.svg' },
  { name: 'article', url: 'assets/icons/article.svg' },
  { name: 'attachment', url: 'assets/icons/attachment.svg' },
  { name: 'AUD', url: 'assets/icons/attach_money.svg' },
  { name: 'block', url: 'assets/icons/block.svg' },
  { name: 'build', url: 'assets/icons/build.svg' },
  { name: 'business', url: 'assets/icons/business.svg' },
  { name: 'CAD', url: 'assets/icons/attach_money.svg' },
  { name: 'calendar_today', url: 'assets/icons/calendar_today.svg' },
  { name: 'call_end', url: 'assets/icons/call_end.svg' },
  { name: 'campaign', url: 'assets/icons/campaign.svg' },
  { name: 'cancel', url: 'assets/icons/cancel.svg' },
  { name: 'check', url: 'assets/icons/check.svg' },
  { name: 'check_circle', url: 'assets/icons/check_circle.svg' },
  { name: 'chevron_left', url: 'assets/icons/chevron_left.svg' },
  { name: 'chevron_right', url: 'assets/icons/chevron_right.svg' },
  { name: 'CHF', url: 'assets/icons/CHF.svg' },
  { name: 'close', url: 'assets/icons/close.svg' },
  { name: 'cloud_download', url: 'assets/icons/cloud_download.svg' },
  { name: 'cloud_upload', url: 'assets/icons/cloud_upload.svg' },
  { name: 'close', url: 'assets/icons/close.svg' },
  { name: 'comment', url: 'assets/icons/comment.svg' },
  { name: 'CNY', url: 'assets/icons/CNY.svg' },
  { name: 'dashboard', url: 'assets/icons/dashboard.svg' },
  { name: 'delete', url: 'assets/icons/delete.svg' },
  { name: 'document', url: 'assets/icons/document.svg' },
  { name: 'done_all', url: 'assets/icons/done_all.svg' },
  { name: 'drafts', url: 'assets/icons/drafts.svg' },
  { name: 'drag_indicator', url: 'assets/icons/drag_indicator.svg' },
  { name: 'edit', url: 'assets/icons/edit.svg' },
  { name: 'estimated', url: 'assets/icons/estimated.svg' },
  { name: 'EUR', url: 'assets/icons/euro.svg' },
  { name: 'excel', url: 'assets/icons/excel.svg' },
  { name: 'expand_less', url: 'assets/icons/expand_less.svg' },
  { name: 'expand_more', url: 'assets/icons/expand_more.svg' },
  { name: 'favorite', url: 'assets/icons/favorite.svg' },
  { name: 'favorite_border', url: 'assets/icons/favorite_border.svg' },
  { name: 'favorite_filled', url: 'assets/icons/favorite_filled.svg' },
  { name: 'file_copy', url: 'assets/icons/file_copy.svg' },
  { name: 'filter_list', url: 'assets/icons/filter_list.svg' },
  { name: 'first_page', url: 'assets/icons/first_page.svg' },
  { name: 'folder', url: 'assets/icons/folder.svg' },
  { name: 'fullscreen', url: 'assets/icons/fullscreen.svg' },
  { name: 'fullscreen_exit', url: 'assets/icons/fullscreen_exit.svg' },
  { name: 'GBP', url: 'assets/icons/GBP.svg' },
  { name: 'group', url: 'assets/icons/group.svg' },
  { name: 'home', url: 'assets/icons/home.svg' },
  { name: 'how_to_reg', url: 'assets/icons/how_to_reg.svg' },
  { name: 'image', url: 'assets/icons/image.svg' },
  { name: 'info', url: 'assets/icons/info.svg' },
  { name: 'invitation', url: 'assets/icons/invitation.svg' },
  { name: 'JPY', url: 'assets/icons/JPY.svg' },
  { name: 'launch', url: 'assets/icons/launch.svg' },
  { name: 'last_page', url: 'assets/icons/last_page.svg' },
  { name: 'local_offer', url: 'assets/icons/local_offer.svg' },
  { name: 'logo_archipel_content', url: 'assets/icons/logo_archipel_content.svg' },
  { name: 'logo_archipel_content_fill', url: 'assets/icons/logo_archipel_content_fill.svg' },
  { name: 'logo_archipel_market_fill', url: 'assets/icons/logo_archipel_market_fill.svg' },
  { name: 'logo_media_financiers', url: 'assets/icons/logo_media_financiers.svg' },
  { name: 'logo_media_financiers_fill', url: 'assets/icons/logo_media_financiers_fill.svg' },
  { name: 'logout', url: 'assets/icons/log_out.svg' },
  { name: 'mail', url: 'assets/icons/mail.svg' },
  { name: 'marketplace', url: 'assets/icons/marketplace.svg' },
  { name: 'menu', url: 'assets/icons/menu.svg' },
  { name: 'mic', url: 'assets/icons/mic.svg' },
  { name: 'mic_off', url: 'assets/icons/mic_off.svg' },
  { name: 'monetization', url: 'assets/icons/monetization.svg' },
  { name: 'more_horiz', url: 'assets/icons/more_horiz.svg' },
  { name: 'more_vert', url: 'assets/icons/more_vert.svg' },
  { name: 'mouse_pointer', url: 'assets/icons/mouse_pointer.svg' },
  { name: 'movie', url: 'assets/icons/movie.svg' },
  { name: 'notifications', url: 'assets/icons/notifications.svg' },
  { name: 'NZD', url: 'assets/icons/NZD.svg' },
  { name: 'paid', url: 'assets/icons/paid.svg' }, // can be used in static model
  { name: 'pause_circle', url: 'assets/icons/pause_circle.svg' },
  { name: 'pdf', url: 'assets/icons/PDF.svg' },
  { name: 'pending', url: 'assets/icons/pending.svg' },
  { name: 'percent', url: 'assets/icons/percent.svg' },
  { name: 'person_add', url: 'assets/icons/person_add.svg' },
  { name: 'play_arrow', url: 'assets/icons/play_arrow.svg' },
  { name: 'play_circle', url: 'assets/icons/play_circle.svg' },
  { name: 'publish', url: 'assets/icons/publish.svg' },
  { name: 'refresh', url: 'assets/icons/refresh.svg' },
  { name: 'restore', url: 'assets/icons/restore.svg' },
  { name: 'refresh_filters', url: 'assets/icons/refresh-filters.svg' },
  { name: 'refuse', url: 'assets/icons/refuse.svg' },
  { name: 'remove_member', url: 'assets/icons/remove_member.svg' },
  { name: 'resend_email', url: 'assets/icons/resend_email.svg' },
  { name: 'save', url: 'assets/icons/save.svg' },
  { name: 'screening', url: 'assets/icons/screening.svg' },
  { name: 'search', url: 'assets/icons/search.svg' },
  { name: 'search_table', url: 'assets/icons/search_table.svg' },
  { name: 'SEK', url: 'assets/icons/SEK.svg' },
  { name: 'sellers', url: 'assets/icons/sellers.svg' },
  { name: 'send', url: 'assets/icons/send.svg' },
  { name: 'shopping_basket', url: 'assets/icons/shopping_basket.svg' },
  { name: 'specific_delivery_list', url: 'assets/icons/specific_delivery_list.svg' },
  { name: 'star', url: 'assets/icons/star.svg' },
  { name: 'star_fill', url: 'assets/icons/star_fill.svg' },
  { name: 'thumb_up', url: 'assets/icons/thumb_up.svg' },
  { name: 'unicorn', url: 'assets/icons/unicorn.svg' },
  { name: 'unpublished', url: 'assets/icons/unpublished.svg' },
  { name: 'update', url: 'assets/icons/update.svg' },
  { name: 'USD', url: 'assets/icons/attach_money.svg' },
  { name: 'video', url: 'assets/icons/video.svg' },
  { name: 'videocam', url: 'assets/icons/videocam.svg' },
  { name: 'videocam_off', url: 'assets/icons/videocam_off.svg' },
  { name: 'video_library', url: 'assets/icons/video_library.svg' },
  { name: 'view_list', url: 'assets/icons/view_list.svg' },
  { name: 'view_module', url: 'assets/icons/view_module.svg' },
  { name: 'visibility', url: 'assets/icons/visibility.svg' },
  { name: 'visibility_off', url: 'assets/icons/visibility_off.svg' },
  { name: 'volume_off', url: 'assets/icons/volume_off.svg' },
  { name: 'volume_up', url: 'assets/icons/volume_up.svg' },
  { name: 'warning', url: 'assets/icons/warning.svg' },
  { name: 'world', url: 'assets/icons/world.svg' },
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
    @Inject(PLATFORM_ID) private platformId
  ) { }

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
