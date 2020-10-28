import { Injectable } from "@angular/core";
import { AngularFireFunctions } from '@angular/fire/functions';
import { ErrorResultResponse } from '@blockframes/utils/utils';
import { EmailRequest, EmailTemplateRequest } from '@blockframes/utils/emails/utils';
import { callFunction } from 'akita-ng-fire';

@Injectable({ providedIn: 'root' })
export class SendGridService {

  constructor(private functions: AngularFireFunctions) { }

  public async sendTestMail(request: EmailRequest, from?: string): Promise<ErrorResultResponse> {
    return callFunction(this.functions, 'onSendTestMail', { request, from });
  }

  public async sendMailWithTemplate(request: EmailTemplateRequest, from?: string) {
    return callFunction(this.functions, 'onSendMailWithTemplate', { request, from });
  }
}
