import { Injectable } from "@angular/core";
import { Functions, httpsCallable } from '@angular/fire/functions';
import { ErrorResultResponse } from '@blockframes/utils/utils';
import { EmailParameters, EmailAdminParameters } from './utils';

@Injectable({ providedIn: 'root' })
export class SendgridService {

  private sendMailAsAdmin = httpsCallable<EmailAdminParameters, ErrorResultResponse>(this.functions, 'sendMailAsAdmin');
  private sendMailWithTemplate = httpsCallable<EmailParameters, ErrorResultResponse>(this.functions, 'sendMailWithTemplate');

  /**
   * Allowed only to Blockframes Admins
   * @param data EmailParameters
   */
  public async sendAsAdmin(data: EmailAdminParameters) {
    const r = await this.sendMailAsAdmin(data);
    return r.data;
  }


  /**
   * Allowed to every user, but they must use a template Id and cannot choose "from".
   * Template ids can be allowed to use in apps/backend-functions/src/internals/email.ts isAllowedToUseTemplate
   * @param data EmailParameters
   */
  public async sendWithTemplate(data: EmailParameters) {
    const r = await this.sendMailWithTemplate(data);
    return r.data;
  }

  constructor(private functions: Functions) { }

}
