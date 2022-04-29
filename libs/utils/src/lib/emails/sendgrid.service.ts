import { Injectable } from '@angular/core';
import { ErrorResultResponse } from '@blockframes/utils/utils';
import { CallableFunctions } from 'ngfire';
import { EmailParameters, EmailAdminParameters } from './utils';

@Injectable({ providedIn: 'root' })
export class SendgridService {

  /**
   * Allowed only to Blockframes Admins
   * @param data EmailParameters
   */
  public async sendAsAdmin(data: EmailAdminParameters) {
    return this.functions.call<EmailAdminParameters, ErrorResultResponse>('sendMailAsAdmin', data);
  }


  /**
   * Allowed to every user, but they must use a template Id and cannot choose "from".
   * Template ids can be allowed to use in apps/backend-functions/src/internals/email.ts isAllowedToUseTemplate
   * @param data EmailParameters
   */
  public async sendWithTemplate(data: EmailParameters) {
    return this.functions.call<EmailParameters, ErrorResultResponse>('sendMailWithTemplate', data);
  }

  constructor(private functions: CallableFunctions) { }

}
