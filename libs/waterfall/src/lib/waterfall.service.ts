import { Injectable } from '@angular/core';
import { CallableFunctions, WriteOptions } from 'ngfire';
import { where, DocumentSnapshot } from '@firebase/firestore';
import { Version, Waterfall, createVersion, createWaterfall, TitleState, History, createDocumentMeta } from '@blockframes/model';
import { jsonDateReviver } from '@blockframes/utils/helpers';
import { AuthService } from '@blockframes/auth/service';
import { doc } from 'firebase/firestore';
import { BlockframesCollection } from '@blockframes/utils/abstract-service';

export const fromOrg = (orgId: string) => [where('orgIds', 'array-contains', orgId)];

@Injectable({ providedIn: 'root' })
export class WaterfallService extends BlockframesCollection<Waterfall> {
  readonly path = 'waterfall';

  constructor(
    private functions: CallableFunctions,
    private authService: AuthService,
  ) {
    super();
  }

  public async buildWaterfall(data: { waterfallId: string, versionId: string, scope?: string[] }) {
    const waterfall = await this.functions.call<{ waterfallId: string, versionId: string, scope?: string[] }, string>('buildWaterfall', data);
    return JSON.parse(waterfall, jsonDateReviver) as { waterfall: { state: TitleState; history: History[] }, version: Version }; // Cloud functions cannot return Dates
  }

  protected override fromFirestore(snapshot: DocumentSnapshot<Waterfall>) {
    if (!snapshot.exists()) return undefined;
    const block = super.fromFirestore(snapshot);
    return createWaterfall(block);
  }

  onUpdate(waterfall: Waterfall, { write }: WriteOptions) {
    const waterfallRef = doc(this.db, `${this.path}/${waterfall.id}`);
    write.update(waterfallRef,
      '_meta.updatedBy', this.authService.uid,
      '_meta.updatedAt', new Date(),
    );
  }

  public async create(id: string, orgIds?: string[]) {
    const createdBy = this.authService.uid;
    const waterfall = createWaterfall({
      _meta: createDocumentMeta({ createdBy }),
      id,
    });
    if (orgIds?.length) waterfall.orgIds = orgIds;
    await this.add(waterfall);
    return waterfall;
  }

  public async addVersion(waterfall: Waterfall, params: Partial<Version>) {
    const version = createVersion(params);
    waterfall.versions.push(version);
    await this.update(waterfall);
    return waterfall;
  }

  public async addBlocksToVersion(waterfall: Waterfall, versionId: string, blockIds: string[]) {
    const existingVersionIndex = waterfall.versions.findIndex(v => v.id === versionId);
    existingVersionIndex !== -1 ?
      blockIds.forEach(id => waterfall.versions[existingVersionIndex].blockIds.push(id)) :
      waterfall.versions.push(createVersion({ id: versionId, blockIds }));
    await this.update(waterfall);
    return waterfall;
  }

  public async removeOrg(waterfallId: string, orgId: string) {
    const waterfall = await this.getValue(waterfallId);
    const orgIds = waterfall.orgIds.filter(id => id !== orgId);
    return this.update(waterfallId, { orgIds });
  }
}
