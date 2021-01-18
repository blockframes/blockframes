import { Injectable } from '@angular/core';
import { CollectionConfig } from 'akita-ng-fire';
import { QueryFn } from '@angular/fire/firestore';
import { AngularFireFunctions } from '@angular/fire/functions';
import { IpService } from '@blockframes/utils/ip';
import { ConsentType } from './consents.firestore'

export const fromOrg = (orgId: string): QueryFn => (ref) =>
  ref.where('orgIds', 'array-contains', orgId);

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'movies' })
export class ConsentsService {
  constructor(
    private functions: AngularFireFunctions,
    private ipService: IpService
  ) {}

  async createConsent(
    consentType: ConsentType,
    docId: string,
    filePath?: string
  ): Promise<boolean> {
    const ip = await this.ipService.get();
    const c = this.functions.httpsCallable('createConsent');
    return await c({ consentType, ip, docId, filePath }).toPromise();
  }
}
