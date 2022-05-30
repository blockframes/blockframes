import { Injectable } from '@angular/core';
import { IpService } from '@blockframes/utils/ip';
import { ConsentType } from '@blockframes/model';
import { CallableFunctions } from 'ngfire';

@Injectable({ providedIn: 'root' })
export class ConsentsService {
  constructor(
    private functions: CallableFunctions,
    private ipService: IpService,
  ) { }

  async createConsent(
    consentType: ConsentType,
    docId: string,
    filePath?: string
  ): Promise<boolean> {
    const ip = await this.ipService.get();
    return this.functions.call<{ consentType: ConsentType, ip: string, docId: string, filePath?: string }, boolean>('createConsent', { consentType, ip, docId, filePath });
  }
}
