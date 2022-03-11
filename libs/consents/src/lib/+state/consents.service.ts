import { Injectable } from '@angular/core';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { IpService } from '@blockframes/utils/ip';
import { ConsentType } from './consents.firestore'

@Injectable({ providedIn: 'root' })
export class ConsentsService {
  constructor(
    private functions: Functions,
    private ipService: IpService,
  ) { }

  async createConsent(
    consentType: ConsentType,
    docId: string,
    filePath?: string
  ): Promise<boolean> {
    const ip = await this.ipService.get();
    const c = httpsCallable<{ consentType: ConsentType, ip: string, docId: string, filePath?: string }, boolean>(this.functions, 'createConsent');
    return (await c({ consentType, ip, docId, filePath })).data;
  }
}
