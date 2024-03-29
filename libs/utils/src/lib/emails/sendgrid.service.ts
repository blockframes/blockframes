import { Injectable } from '@angular/core';
import { CallableFunctions } from 'ngfire';
import { EmailRequest, ErrorResultResponse, EmailTemplateRequest, EmailParameters } from '@blockframes/model';
import { EmailJSON } from '@sendgrid/helpers/classes/email-address';

interface EmailAdminParameters {
  request: EmailRequest | EmailTemplateRequest;
  from?: EmailJSON;
}

@Injectable({ providedIn: 'root' })
export class SendgridService {

  /**
   * Allowed only to Blockframes Admins
   * @param data EmailParameters
   */
  sendAsAdmin = this.functions.prepare<EmailAdminParameters, ErrorResultResponse>('sendMailAsAdmin');

  /**
   * Allowed to every user, but they must use a template Id and cannot choose "from".
   * Template ids can be allowed to use in apps/backend-functions/src/internals/email.ts isAllowedToUseTemplate
   * @param data EmailParameters
   */
  sendWithTemplate = this.functions.prepare<EmailParameters, ErrorResultResponse>('sendMailWithTemplate');

  constructor(private functions: CallableFunctions) { }

}
