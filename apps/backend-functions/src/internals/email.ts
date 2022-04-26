import SendGrid from '@sendgrid/mail';
import { sendgridAPIKey, projectId } from '../environments/environment';
import { groupIds } from '@blockframes/utils/emails/ids';
export { EmailRequest, EmailTemplateRequest } from '@blockframes/utils/emails/utils';
import { emailErrorCodes, EmailRequest, EmailTemplateRequest } from '@blockframes/utils/emails/utils';
import { MailDataRequired } from '@sendgrid/helpers/classes/mail';
import { ErrorResultResponse } from '../utils';
import { CallableContext } from 'firebase-functions/lib/providers/https';
import * as admin from 'firebase-admin';
import { getMailSender, appLogo, applicationUrl } from '@blockframes/utils/apps';
import { EmailJSON } from '@sendgrid/helpers/classes/email-address';
import { logger } from 'firebase-functions';
import { App, appDescription, AppMailSetting, appName } from '@blockframes/model';

// Substitutions used in Sendgrid templates
const substitutions = {
  groupUnsubscribe: "<%asm_group_unsubscribe_raw_url%>",
  preferenceUnsubscribe: "<%asm_preferences_raw_url%>",
  notificationPage: "/c/o/account/profile/view/notifications"
};

/**
 * Array of unsubscribe groups we want to display when users click on the preference link.
 * Like this, we can avoid showing the criticalEmails group, which is linked for example to the reset password email.
 * Users won't be able to unsubscribe from this group and will always received email from the criticalsEmails group.
*/
const groupsToDisplay = [groupIds.unsubscribeAll];

/**
 * Sends a transactional email configured by the EmailRequest provided.
 *
 * Handles development mode: logs a warning when no sendgrid API key is provided.
 * @param groupId passing 0 to groupId will make the unsubscribe link global
 */
export async function sendMail(email: EmailRequest, from: EmailJSON = getMailSender(), groupId: number = groupIds.criticalsEmails) {
  const msg: MailDataRequired = {
    ...email,
    from,
    asm: groupId ? { groupId, groupsToDisplay } : undefined,
    substitutions: substitutions,
    customArgs: { projectId }
  };

  return send(msg);
}

export function sendMailFromTemplate({ to, templateId, data }: EmailTemplateRequest, app: App, groupId: number = groupIds.criticalsEmails) {
  const from: EmailJSON = getMailSender(app);
  const name = appName[app];
  const appText = appDescription[app];
  const appLogoLink = appLogo[app];
  const appLink = applicationUrl[app];
  const appMailSettings: AppMailSetting = { description: appText, logo: appLogoLink, name, url: appLink }

  const msg: MailDataRequired = {
    from,
    to,
    templateId,
    dynamicTemplateData: { ...data, ...substitutions, app: appMailSettings, from },
    asm: { groupId, groupsToDisplay },
    customArgs: { projectId }
  };

  if (data.event?.calendar) {
    msg.attachments = [data.event.calendar];
  }

  return send(msg);
}

async function send(msg: MailDataRequired) {
  if (sendgridAPIKey === '') {
    throw new Error(emailErrorCodes.missingKey.code);
  }

  SendGrid.setApiKey(sendgridAPIKey);
  return SendGrid.send(msg).catch(e => {
    if (e.message === 'Unauthorized') {
      logger.error(emailErrorCodes.unauthorized.message);
      throw new Error(emailErrorCodes.unauthorized.code);
    } else {
      logger.error(emailErrorCodes.general.message);
      throw new Error(emailErrorCodes.general.code);
    }
  });
}

/**
 * Http callabable function to send an email just like the other emails of the app are sent.
 * For testing purposes
 * @param data
 *  Request:  subject, text and to email
 *  App: the from email that will be used as sender (optional)
 * @param context
 */
export const sendMailAsAdmin = async (
  data: { request: EmailRequest, from?: EmailJSON },
  context: CallableContext
): Promise<ErrorResultResponse> => {
  const db = admin.firestore();
  if (!context?.auth) {
    throw new Error('Permission denied: missing auth context.');
  }

  const bfadmin = await db.doc(`blockframesAdmin/${context.auth.uid}`).get();
  if (!bfadmin.exists) { throw new Error('Permission denied: you are not blockframes admin'); }

  try {
    await sendMail(data.request, data.from || getMailSender());
    return { error: '', result: 'OK' };
  } catch (error) {
    return {
      error: error.message ? error.message : 'Unknown error',
      result: 'NOK'
    };
  }
}

/**
 * Http callabable function to send an email with template.
 * @param data
 *  Request:  template id with expected variables and to email
 *  App: the app from which the call to this function was made (optional)
 * @param context
 */
export const sendMailWithTemplate = async (
  data: { request: EmailTemplateRequest, app?: App },
  context: CallableContext
): Promise<ErrorResultResponse> => {
  if (!context?.auth) {
    throw new Error('Permission denied: missing auth context.');
  }

  if (!isAllowedToUseTemplate(data.request.templateId, context.auth.uid)) {
    throw new Error('Permission denied: user not allowed.');
  }

  try {
    await sendMailFromTemplate(data.request, data.app);
    return { error: '', result: 'OK' };
  } catch (error) {
    return {
      error: error.message ? error.message : 'Unknown error',
      result: 'NOK'
    };
  }
}

/**
 * Check if current user is allowed to use this template id for sending email
 * @param templateId
 * @param uid
 */
function isAllowedToUseTemplate(templateId: string, uid: string) {
  templateId = uid; //! Fix linter error, delete this once updated.
  // @TODO #4085
  return true;
}
