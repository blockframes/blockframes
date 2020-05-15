import { Injectable } from '@angular/core';
import { AngularFireFunctions } from '@angular/fire/functions';
import { EmailRequest } from '@blockframes/utils/emails';
import { ErrorResultResponse } from '@blockframes/utils/utils';

@Injectable({ providedIn: 'root' })
export class AdminService  {
  constructor(
    private functions: AngularFireFunctions
  ) {}

  public async sendTestMail(request: EmailRequest, from? : string ): Promise<ErrorResultResponse> {
    const f = this.functions.httpsCallable('onSendTestMail');
    return f({ request, from }).toPromise();
  }
}
