import { Injectable } from '@angular/core';
import { CollectionConfig, CollectionService } from 'akita-ng-fire';
import { QueryFn } from '@angular/fire/firestore';
import { ConsentsState, ConsentsStore } from './consents.store';
import { AngularFireFunctions } from '@angular/fire/functions';
import { IpService } from '@blockframes/utils/ip';

export const fromOrg = (orgId: string): QueryFn => (ref) =>
  ref.where('orgIds', 'array-contains', orgId);

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'movies' })
export class ConsentsService extends CollectionService<ConsentsState> {
  constructor(
    protected store: ConsentsStore,
    private functions: AngularFireFunctions,
    private ipService: IpService
  ) {
    super(store);
  }

  async createConsent(
    consentType: 'access' | 'share',
    docId: string,
    filePath?: string
  ): Promise<boolean> {
    const ip = await this.ipService.get();
    const c = this.functions.httpsCallable('createConsent');
    return await c({ consentType, ip, docId, filePath }).toPromise();
  }
}
