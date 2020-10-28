import { Injectable } from "@angular/core";
import { AngularFireFunctions } from '@angular/fire/functions';
import { ErrorResultResponse } from '@blockframes/utils/utils';
import { EmailRequest, EmailTemplateRequest } from '@blockframes/utils/emails/utils';
import { callFunction } from 'akita-ng-fire';
import { App } from '../apps';

@Injectable({ providedIn: 'root' })
export class SendgridService {

  /**
   * Allowed only to Blockframes Admins
   * @param request 
   * @param from 
   */
  sendAsAdmin: (request: EmailRequest, from?: string) => Promise<ErrorResultResponse> = callFunction.bind(this.functions, 'sendMailAsAdmin');

  /**
   * Allowed to every user, but they must use a template Id and cannot choose "from".
   * Template ids can be allowed to use in apps/backend-functions/src/internals/email.ts isAllowedToUseTemplate
   * @param request 
   * @param app 
   */
  sendWithTemplate: (request: EmailTemplateRequest, app?: App) => Promise<ErrorResultResponse> = callFunction.bind(this.functions, 'sendMailWithTemplate');

  constructor(private functions: AngularFireFunctions) { }
}
