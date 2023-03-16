/**
 * Apps definition
 */
import { EmailJSON } from '@sendgrid/helpers/classes/email-address';
import { appUrl } from '@env';
import { App } from '@blockframes/model';

export const sendgridEmailsFrom: Record<App | 'default', EmailJSON> = {
  catalog: { email: 'team@archipelcontent.com', name: 'Archipel Content' },
  festival: { email: 'team@archipelmarket.com', name: 'Archipel Market' },
  financiers: { email: 'team@mediafinanciers.com', name: 'Media Financiers' },
  waterfall: { email: 'team@cascade8.com', name: 'Blockframes' }, // TODO #9257 change this
  crm: { email: 'team@cascade8.com', name: 'Cascade 8' },
  default: { email: 'team@cascade8.com', name: 'Cascade 8' },
} as const;

// Those logos have to be in PNG because Gmail doesn't support SVG images
export const appLogo = {
  catalog: `${appUrl.content}/assets/email/archipel-content.png`,
  festival: `${appUrl.market}/assets/email/archipel-market.png`,
  financiers: `${appUrl.financiers}/assets/email/media-financiers.png`,
  waterfall: `${appUrl.waterfall}/assets/email/archipel-market.png`, // TODO #9257 change this
  crm: '',
};
export type AppLogoValue = typeof appLogo[App];

export const applicationUrl: Record<App, string> = {
  festival: appUrl.market,
  catalog: appUrl.content,
  financiers: appUrl.financiers,
  waterfall: appUrl.waterfall,
  crm: appUrl.crm,
};

/**
 * Returns the "from" email that should be used depending on the current app
 * @param a
 */
export function getMailSender(a?: App): EmailJSON {
  if (!a) {
    return sendgridEmailsFrom.default;
  } else {
    return sendgridEmailsFrom[a] || sendgridEmailsFrom.default;
  }
}
