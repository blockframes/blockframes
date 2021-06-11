import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export const icons = [
  { name: 'access_time', url: 'assets/icons/access_time.svg' },
  { name: 'account_balance_wallet', url: 'assets/icons/account_balance_wallet.svg' },
  { name: 'account_circle', url: 'assets/icons/account_circle.svg' },
  { name: 'add', url: 'assets/icons/add.svg' },
  { name: 'archipel_content', url: 'assets/icons/archipel_content.svg' }, // no use
  { name: 'archipel_content_fill', url: 'assets/icons/archipel_content_fill.svg' }, // no use
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
  { name: 'blank', url: 'assets/icons/blank.svg' }, // no use
  { name: 'block', url: 'assets/icons/block.svg' },
  { name: 'build', url: 'assets/icons/build.svg' },
  { name: 'business', url: 'assets/icons/business.svg' },
  { name: 'CAD', url: 'assets/icons/attach_money.svg' },
  { name: 'calendar_today', url: 'assets/icons/calendar_today.svg' },
  { name: 'call_end', url: 'assets/icons/call_end.svg' },
  { name: 'campaign', url: 'assets/icons/campaign.svg' },
  { name: 'cancel', url: 'assets/icons/cancel.svg' },
  { name: 'certificate', url: 'assets/icons/certificate.svg' }, // no use
  { name: 'check', url: 'assets/icons/check.svg' },
  { name: 'checkbox_outline', url: 'assets/icons/checkbox_outline.svg' }, // no use
  { name: 'check_circle', url: 'assets/icons/check_circle.svg' },
  { name: 'chevron_left', url: 'assets/icons/chevron_left.svg' }, // no use
  { name: 'chevron_right', url: 'assets/icons/chevron_right.svg' },
  { name: 'CHF', url: 'assets/icons/CHF.svg' },
  { name: 'clear_all', url: 'assets/icons/clear_all.svg' }, // no use
  { name: 'close', url: 'assets/icons/close.svg' },
  { name: 'cloud_download', url: 'assets/icons/cloud_download.svg' },
  { name: 'cloud_upload', url: 'assets/icons/cloud_upload.svg' },
  { name: 'CNY', url: 'assets/icons/CNY.svg' },
  { name: 'create_movie', url: 'assets/icons/create_movie.svg' }, // no use
  { name: 'dashboard', url: 'assets/icons/dashboard.svg' },
  { name: 'delete', url: 'assets/icons/delete.svg' },
  { name: 'document', url: 'assets/icons/document.svg' },
  { name: 'document_signed', url: 'assets/icons/document_signed.svg' }, // no use
  { name: 'document_to_signed', url: 'assets/icons/document_to_signed.svg' }, // no use
  { name: 'done_all', url: 'assets/icons/done_all.svg' },
  { name: 'drafts', url: 'assets/icons/drafts.svg' }, // no use
  { name: 'drag_indicator', url: 'assets/icons/drag_indicator.svg' },
  { name: 'edit', url: 'assets/icons/edit.svg' },
  { name: 'estimated', url: 'assets/icons/estimated.svg' },
  { name: 'EUR', url: 'assets/icons/euro.svg' },
  { name: 'excel', url: 'assets/icons/excel.svg' },
  { name: 'expand_less', url: 'assets/icons/expand_less.svg' },
  { name: 'expand_more', url: 'assets/icons/expand_more.svg' },
  { name: 'facebook', url: 'assets/icons/facebook.svg' }, // no use
  { name: 'favorite', url: 'assets/icons/favorite.svg' },
  { name: 'favorite_border', url: 'assets/icons/favorite_border.svg' },
  { name: 'favorite_filled', url: 'assets/icons/favorite_filled.svg' },
  { name: 'file_copy', url: 'assets/icons/file_copy.svg' },
  { name: 'filter_list', url: 'assets/icons/filter_list.svg' },
  { name: 'first_page', url: 'assets/icons/first_page.svg' }, // no use
  { name: 'folder', url: 'assets/icons/folder.svg' },
  { name: 'fullscreen', url: 'assets/icons/fullscreen.svg' },
  { name: 'fullscreen_exit', url: 'assets/icons/fullscreen_exit.svg' },
  { name: 'GBP', url: 'assets/icons/GBP.svg' },
  { name: 'gift', url: 'assets/icons/gift.svg' }, // no use
  { name: 'group', url: 'assets/icons/group.svg' },
  { name: 'home', url: 'assets/icons/home.svg' },
  { name: 'how_to_reg', url: 'assets/icons/how_to_reg.svg' },
  { name: 'image', url: 'assets/icons/image.svg' },
  { name: 'info', url: 'assets/icons/info.svg' },
  { name: 'instagram', url: 'assets/icons/instagram.svg' }, // no use
  { name: 'invitation', url: 'assets/icons/invitation.svg'},
  { name: 'JPY', url: 'assets/icons/JPY.svg' },
  { name: 'last_page', url: 'assets/icons/last_page.svg' }, // no use
  { name: 'launch', url: 'assets/icons/launch.svg' },
  { name: 'light_mode', url: 'assets/icons/light_mode.svg' }, // no use
  { name: 'linkedin', url: 'assets/icons/linkedin.svg' }, // no use
  { name: 'local_offer', url: 'assets/icons/local_offer.svg' },
  { name: 'lock', url: 'assets/icons/lock.svg' }, // no use
/** globalement ces logo ne sont pas utilisés ou utilisés pour CRM */
  { name: 'logo_archipel_content', url: 'assets/icons/logo_archipel_content.svg' }, //! Doublon (attention pour les emails)
  { name: 'logo_archipel_content_fill', url: 'assets/icons/logo_archipel_content_fill.svg' }, //! Doublon (attention pour les emails)
  { name: 'logo_archipel_market_fill', url: 'assets/icons/logo_archipel_market_fill.svg' },
  { name: 'logo_media_financiers', url: 'assets/icons/logo_media_financiers.svg' }, //! Doublon (attention pour les emails)
  { name: 'logo_media_financiers_fill', url: 'assets/icons/logo_media_financiers_fill.svg' }, //! Doublon (attention pour les emails)
  { name: 'logout', url: 'assets/icons/log_out.svg' },
  { name: 'mail', url: 'assets/icons/mail.svg' },
  { name: 'marketplace', url: 'assets/icons/marketplace.svg' },
  { name: 'matching', url: 'assets/icons/matching.svg' }, // no use
  { name: 'medal', url: 'assets/icons/medal.svg' }, // no use ?
  { name: 'media_financiers', url: 'assets/icons/media_financiers.svg' }, //? no use ???
  { name: 'media_financiers_fill', url: 'assets/icons/media_financiers_fill.svg' }, //? no use ???
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
  { name: 'open_to', url: 'assets/icons/open_to.svg' }, // no use
  { name: 'padlock', url: 'assets/icons/padlock.svg' }, // no use
  { name: 'paid', url: 'assets/icons/paid.svg' }, //* can be used in static model
  { name: 'pause_circle', url: 'assets/icons/pause_circle.svg' },
  { name: 'pdf', url: 'assets/icons/PDF.svg' },
  { name: 'pending', url: 'assets/icons/pending.svg' },
  { name: 'percent', url: 'assets/icons/percent.svg' },
  { name: 'person_add', url: 'assets/icons/person_add.svg' },
  { name: 'play_arrow', url: 'assets/icons/play_arrow.svg' },
  { name: 'play_circle', url: 'assets/icons/play_circle.svg' },
  { name: 'refresh', url: 'assets/icons/refresh.svg' },
  { name: 'refresh_filters', url: 'assets/icons/refresh-filters.svg' },
  { name: 'remove_member', url: 'assets/icons/remove_member.svg' },
  { name: 'resend_email', url: 'assets/icons/resend_email.svg' },
  { name: 'save', url: 'assets/icons/save.svg' },
  { name: 'screening', url: 'assets/icons/screening.svg' },
  { name: 'search', url: 'assets/icons/search.svg' },
  { name: 'search_table', url: 'assets/icons/search_table.svg' },
  { name: 'SEK', url: 'assets/icons/SEK.svg' },
  { name: 'sellers', url: 'assets/icons/sellers.svg' },
  { name: 'send', url: 'assets/icons/send.svg' },
  { name: 'settings', url: 'assets/icons/settings.svg' }, // no use
  { name: 'share', url: 'assets/icons/share.svg' }, // no use
  { name: 'shopping_basket', url: 'assets/icons/shopping_basket.svg' },
  { name: 'shopping_cart', url: 'assets/icons/shopping_cart.svg' }, // no use
  { name: 'sign_ok', url: 'assets/icons/sign_ok.svg' }, // no use
  { name: 'specific_delivery_list', url: 'assets/icons/specific_delivery_list.svg' },
  { name: 'spinner', url: 'assets/icons/spinner.svg' }, // no use
  { name: 'star', url: 'assets/icons/star.svg' },
  { name: 'star_fill', url: 'assets/icons/star_fill.svg' },
  { name: 'text_area', url: 'assets/icons/text_area.svg' }, // no use
  { name: 'textsms', url: 'assets/icons/textsms.svg' }, // no use
  { name: 'thumb_down', url: 'assets/icons/thumb_down.svg' }, // no use
  { name: 'thumb_up', url: 'assets/icons/thumb_up.svg' },
  { name: 'translate', url: 'assets/icons/translate.svg' }, // no use
  { name: 'trophy', url: 'assets/icons/trophy.svg' }, // no use
  { name: 'twitter', url: 'assets/icons/twitter.svg' }, // no use
  { name: 'unicorn', url: 'assets/icons/unicorn.svg' },
  { name: 'unpublished', url: 'assets/icons/unpublished.svg' },
  { name: 'update', url: 'assets/icons/update.svg' },
  { name: 'USD', url: 'assets/icons/attach_money.svg' },
  { name: 'validation_required', url: 'assets/icons/validation_required.svg' }, // no use
  { name: 'video', url: 'assets/icons/video.svg' },
  { name: 'videocam', url: 'assets/icons/videocam.svg' },
  { name: 'videocam_off', url: 'assets/icons/videocam_off.svg' },
  { name: 'video_library', url: 'assets/icons/video_library.svg' },
  { name: 'view_list', url: 'assets/icons/view_list.svg' },
  { name: 'view_module', url: 'assets/icons/view_module.svg' },
  { name: 'visibility', url: 'assets/icons/visibility.svg' },
  { name: 'visibility_off', url: 'assets/icons/visibility_off.svg'},
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


//? /** LOGO */
/*
- il nous faut un 'empty_organization' comme pour les images.
- réorganiser et renommer les logos des apps
- 2 logos n'ont pas de dark/light mode (utilisés uniquement sur la landing = BPI et Creative Europe Media)
- le logo pulsar n'est pas utilisé
*/


//? /** IMAGES SVG */
/*
//* --- Light et Dark SVG ---
- completed
- contract_offer
- development (mais elles sont très différentes)
- empty_cast_descriptioin
- empty_crew_description
- empty_director_description
- empty_filmography
- exclusive_priviledges
- gift
- hero
- knowledge
- mail (utilisé pour le validation de donnée lors de l'inscription)
- movie_form_illustration
- no_stats_promo
- no_views
- no_wishlist === no_titles (webp, seulement le + dans le ccercle rouge qui est différent)
- org === empty_org (webp)
- post_production
- production
- released
- rocket_background
- tag_along
- topfilms
- user
- wait

//* --- Dark SVG uniquement ---
- experts (non utilisée)
- investment (non utilisée)
- investment_share (non utilisée)

*/

//? --- Root du dossier asset ---
/*
- ACM_banner_landing : non utilisée (c'est la même que banner_landing, banner_header est la même en plus sombre)
- background_maintenance === banner_header
- banner_empty: utilisé pour certain fond (notamment hero sur home page)
- banner_header: utilisé sur les landing de catalog et festival
- banner_home: non utilisée
- banner_landing.png: utilisé pour la landing de financiers
- clouds: utilisation sur pending page acconut creation
- meeting: utilisé pour le lobby des events
*/

//? /** IMAGES WEBP */
/*

//* --- LIGHT UNIQUEMENT ---
- sale: non utilisé
- empty_organization === dark mode

//* --- DARK UNIQUEMENT ---
- thank_you: non utilisé

//* --- DARK ET LIGHT ---
- bulk_import === add_files
- buyer_marketplace: non utilisée
- contract_details: non utilisée
- find_organization: non utilisé
- gears: non utilisée
- join_orga & login_signin = doublon, la rocket, presque la même taille (non utilisées)
- licensed_rights_contractform: non utilisée
- media: non utilisée
- profil_user & user: doublon (uniquement zone ombragée autour des pometttes)
- seller_dashboard: non utilisée
- servicing_included: non utilisée
- upload_380: à renommer (utilisé)
- welcome_archipel_content: non utilisée

*/
