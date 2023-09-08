import { Injectable } from '@angular/core';
import { CallableFunctions, WriteOptions } from 'ngfire';
import { where, DocumentSnapshot } from '@firebase/firestore';
import {
  Version,
  Waterfall,
  createVersion,
  createWaterfall,
  TitleState,
  History,
  createDocumentMeta,
  WaterfallSource
} from '@blockframes/model';
import { jsonDateReviver } from '@blockframes/utils/helpers';
import { AuthService } from '@blockframes/auth/service';
import { doc } from 'firebase/firestore';
import { BlockframesCollection } from '@blockframes/utils/abstract-service';
import { waterfall as _waterfall } from './main';
import { BlockService } from './block.service';

export const fromOrg = (orgId: string) => [where('orgIds', 'array-contains', orgId)];

@Injectable({ providedIn: 'root' })
export class WaterfallService extends BlockframesCollection<Waterfall> {
  readonly path = 'waterfall';

  constructor(
    private functions: CallableFunctions,
    private authService: AuthService,
    private blockService: BlockService,
  ) {
    super();
  }

  public async buildWaterfall(data: { waterfallId: string, versionId: string }) {
    if (this.app === 'crm') return this.buildWaterfallAdmin(data); // Current user is admin, no need to use backend function.
    const waterfall = await this.functions.call<{ waterfallId: string, versionId: string }, string>('buildWaterfall', data);
    return JSON.parse(waterfall, jsonDateReviver) as { waterfall: { state: TitleState; history: History[] }, version: Version }; // Cloud functions cannot return Dates
  }

  /**
   * Used only by BlockframesAdmin users that can bypass database rules
   * @param data 
   */
  private async buildWaterfallAdmin(data: { waterfallId: string, versionId: string }) {
    const waterfall = await this.getValue(data.waterfallId);
    const blocks = await this.blockService.getValue({ waterfallId: data.waterfallId });

    const version = waterfall.versions.find(v => v.id === data.versionId);
    const versionBlocks = version.blockIds.map(blockId => {
      const block = blocks.find(b => b.id === blockId);
      return block;
    });

    const actions = versionBlocks.map(block => Object.values(block.actions));
    return { waterfall: _waterfall(data.waterfallId, actions), version };
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
    return this.update(waterfallId, { id: waterfallId, orgIds });
  }

  public async addSource(waterfallId: string, source: WaterfallSource) {
    const waterfall = await this.getValue(waterfallId);
    if (!waterfall.sources.find(s => s.name === source.name)) waterfall.sources.push(source);
    return this.update(waterfallId, { id: waterfallId, sources: waterfall.sources });
  }

  public async removeSources(waterfallId: string, sourceIds: string[]) {
    const waterfall = await this.getValue(waterfallId);
    return this.update(waterfallId, { id: waterfallId, sources: waterfall.sources.filter(s => !sourceIds.includes(s.id)) });
  }

  public async removeRightholders(waterfallId: string, rightholderIds: string[]) {
    const waterfall = await this.getValue(waterfallId);
    return this.update(waterfallId, { id: waterfallId, rightholders: waterfall.rightholders.filter(s => !rightholderIds.includes(s.id)) });
  }
}
