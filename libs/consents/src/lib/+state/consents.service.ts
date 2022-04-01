import { Injectable } from '@angular/core';
import { AngularFireFunctions } from '@angular/fire/functions';
import { IpService } from '@blockframes/utils/ip';
import { ConsentType } from '@blockframes/shared/model';

@Injectable({ providedIn: 'root' })
export class ConsentsService {
  constructor(private functions: AngularFireFunctions, private ipService: IpService) {}

  async createConsent(consentType: ConsentType, docId: string, filePath?: string): Promise<boolean> {
    const ip = await this.ipService.get();
    const c = this.functions.httpsCallable('createConsent');
    return await c({ consentType, ip, docId, filePath }).toPromise();
  }
}
