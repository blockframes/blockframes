import SendGrid from '@sendgrid/mail';
import { sendgridAPIKey } from '../environments/environment';
export { EmailRequest, EmailTemplateRequest } from '@blockframes/utils/emails/utils';
import { emailErrorCodes, EmailRequest, EmailTemplateRequest } from '@blockframes/utils/emails/utils';
import { MailDataRequired } from '@sendgrid/helpers/classes/mail';
import { ErrorResultResponse } from '../utils';
import { CallableContext } from 'firebase-functions/lib/providers/https';
import * as admin from 'firebase-admin';
import { App, getSendgridFrom, AppMailSetting, getAppName, appLogo, applicationUrl, appDescription } from '@blockframes/utils/apps';
import { EmailJSON } from '@sendgrid/helpers/classes/email-address';

/**
 * Sends a transactional email configured by the EmailRequest provided.
 *
 * Handles development mode: logs a warning when no sendgrid API key is provided.
 */
export async function sendMail({ to, subject, text }: EmailRequest, from: EmailJSON = getSendgridFrom(), catchError = true): Promise<boolean> {
  const msg: MailDataRequired = {
    from,
    to,
    subject,
    text,
  };

  if(catchError){
    return send(msg).catch(e => {
      console.warn(e.message);
      return false;
    });
  } else {
    // We let parent function catch the error
    return send(msg);
  }

}

export function sendMailFromTemplate({ to, templateId, data }: EmailTemplateRequest, app: App, catchError = true): Promise<boolean> {
  const from: EmailJSON = getSendgridFrom(app);
  const { label } = getAppName(app);
  const appText = appDescription[app];
  const appLogoLink = appLogo[app];
  const appLink = applicationUrl[app];
  const appMailSettings: AppMailSetting = { description: appText, logo: appLogoLink, name: label, url: appLink }
  const msg: MailDataRequired = {
    from,
    to,
    templateId,
    dynamicTemplateData: { ...data, app: appMailSettings, from }
  };

  if(catchError){
    return send(msg).catch(e => {
      console.warn(e.message);
      return false;
    });
  } else {
    // We let parent function catch the error
    return send(msg);
  }
}

async function send(msg: MailDataRequired): Promise<boolean> {
  if (sendgridAPIKey === '') {
    throw new Error(emailErrorCodes.E03.code);
  }

  SendGrid.setApiKey(sendgridAPIKey);
  return SendGrid.send(msg).then(_ => true).catch(e => {
    if (e.message === 'Unauthorized') {
      throw new Error(emailErrorCodes.E01.code);
    } else {
      throw new Error(emailErrorCodes.E02.code);
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
    await sendMail(data.request, data.from || getSendgridFrom());
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
  // @TODO #4085
  return true;
}
