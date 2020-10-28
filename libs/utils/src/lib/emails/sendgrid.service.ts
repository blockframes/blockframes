import { Injectable } from "@angular/core";
import { AngularFireFunctions } from '@angular/fire/functions';
import { ErrorResultResponse } from '@blockframes/utils/utils';
import { EmailParameters } from '@blockframes/utils/emails/utils';
import { callFunction } from 'akita-ng-fire';

@Injectable({ providedIn: 'root' })
export class SendgridService {

  /**
   * Allowed only to Blockframes Admins
   * @param data EmailParameters
   */
  sendAsAdmin: (data: EmailParameters) => Promise<ErrorResultResponse> = this.callable('sendMailAsAdmin');

  /**
   * Allowed to every user, but they must use a template Id and cannot choose "from".
   * Template ids can be allowed to use in apps/backend-functions/src/internals/email.ts isAllowedToUseTemplate
   * @param data EmailParameters
   */
  sendWithTemplate: (data: EmailParameters) => Promise<ErrorResultResponse> = this.callable('sendMailWithTemplate');

  constructor(private functions: AngularFireFunctions) { }

  callable(method: string) {
    return callFunction.bind(this, this.functions, method);
  }
}
