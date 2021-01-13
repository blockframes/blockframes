import { Injectable } from '@angular/core';
import { CollectionConfig, CollectionService, WriteOptions } from 'akita-ng-fire';
import { switchMap, filter, tap, map } from 'rxjs/operators';
import { createAccess, createConsent, createShare } from './consents.model';
import { QueryFn } from '@angular/fire/firestore';
import { ConsentsState, ConsentsStore } from './consents.store';
import { Consents } from './consents.firestore';
import { AuthQuery } from '@blockframes/auth/+state/auth.query';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { App, getCurrentApp } from '@blockframes/utils/apps';
import { OrganizationQuery } from '@blockframes/organization/+state';
import { createDocumentMeta } from "@blockframes/utils/models-meta";
import { createStoreConfig } from '../../../../movie/src/lib/movie/+state/movie.model';
import { cleanModel } from '@blockframes/utils/helpers';
import { AngularFireFunctions } from '@angular/fire/functions';
import { HttpClient } from '@angular/common/http';
import { IpService } from '@blockframes/utils/ip';


export const fromOrg = (orgId: string): QueryFn => ref => ref.where('orgIds', 'array-contains', orgId);

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'movies' })
export class ConsentsService extends CollectionService<ConsentsState> {

  constructor(
    protected store: ConsentsStore,
    private http: HttpClient,
    private functions: AngularFireFunctions,
    private ipService: IpService
  ) {
    super(store);
  }

  formatFromFirestore(consent: any) {
    return createConsent(consent);
  }

  // async create(consentCreated?: Consents<Date>): Promise<Consents<Date>> {
  //   const createBy = this.authQuery.userId;
  //   const appName = getCurrentApp(this.routerQuery);
  //   let orgIds = [];
  //   if (!!consentCreated?.id.length) {
  //     orgIds = consentCreated.access;
  //   } else {
  //     const orgId = this.orgQuery.getActiveId();
  //     orgIds.push(orgId);
  //   }


  //   const consent = createConsent({...consentCreated});
  //   await this.runTransaction(async (tx) => {
  //     consent.id = await this.add(cleanModel(consent), {write: tx});
  //   });
  //   return consent;
  // }

  async createConsent(consentType: 'access' | 'share', docId: string, filePath?: string): Promise<Consents<Date>> {

    const ip = await this.ipService.get();
    const c = this.functions.httpsCallable('createConsent');
    return await c({consentType, ip, docId, filePath }).toPromise();

  }

}
