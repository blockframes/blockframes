import { Injectable } from "@angular/core";
import { AngularFireFunctions } from '@angular/fire/functions';
import { ErrorResultResponse } from '@blockframes/utils/utils';
import { EmailRequest, EmailTemplateRequest } from '@blockframes/utils/emails/utils';
import { callFunction } from 'akita-ng-fire';
import { App } from '../apps';

@Injectable({ providedIn: 'root' })
export class SendGridService {

  constructor(private functions: AngularFireFunctions) { }

  public async sendTestMail(request: EmailRequest, from?: string): Promise<ErrorResultResponse> {
    return callFunction(this.functions, 'onSendTestMail', { request, from });
  }

  public async sendMailWithTemplate(request: EmailTemplateRequest, app?: App): Promise<ErrorResultResponse> {
    return callFunction(this.functions, 'onSendMailWithTemplate', { request, app });
  }
}
