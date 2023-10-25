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
  WaterfallSource,
  Action,
  ActionName,
  contractsToActions,
  rightsToActions,
  incomesToActions,
  expensesToActions,
  statementsToActions,
  groupByDate,
  WaterfallContract,
  Term,
  Right,
  Income,
  Expense,
  Statement,
  Block,
  WaterfallDocument,
  investmentsToActions
} from '@blockframes/model';
import { jsonDateReviver, unique } from '@blockframes/utils/helpers';
import { AuthService } from '@blockframes/auth/service';
import { doc } from 'firebase/firestore';
import { BlockframesCollection } from '@blockframes/utils/abstract-service';
import { waterfall as _waterfall } from './main';
import { BlockService } from './block.service';

export const fromOrg = (orgId: string) => [where('orgIds', 'array-contains', orgId)];

export interface WaterfallState {
  waterfall: { state: TitleState; history: History[] };
  version: Version;
}

export interface WaterfallData {
  waterfall: Waterfall;
  documents: WaterfallDocument[];
  contracts: WaterfallContract[];
  terms: Term[];
  rights: Right[];
  incomes: Income[];
  expenses: Expense[];
  statements: Statement[];
  blocks: Block[];
}

@Injectable({ providedIn: 'root' })
export class WaterfallService extends BlockframesCollection<Waterfall> {
  readonly path = 'waterfall';

  constructor(
    private functions: CallableFunctions,
    private authService: AuthService,
    private blockService: BlockService
  ) {
    super();
  }

  protected override fromFirestore(snapshot: DocumentSnapshot<Waterfall>) {
    if (!snapshot.exists()) return undefined;
    const block = super.fromFirestore(snapshot);
    return createWaterfall(block);
  }

  public async buildWaterfall(data: { waterfallId: string, versionId: string, date?: Date, canBypassRules?: boolean }) {
    const waterfall = data.canBypassRules ? await this.buildWaterfallAdmin(data) : await this.buildWaterfallUser(data);

    if (data.date) { // Stops waterfall at a given date
      waterfall.waterfall.history = waterfall.waterfall.history.filter(h => {
        const stateDate = new Date(h.date);
        const compareDate = data.date;
        stateDate.setHours(0, 0, 0, 0);
        compareDate.setHours(0, 0, 0, 0);
        return stateDate.getTime() <= compareDate.getTime();
      });
      waterfall.waterfall.state = waterfall.waterfall.history[waterfall.waterfall.history.length - 1];
    }

    return waterfall;
  }

  /**
   * Because of rules, regular users have to use backend function.
   * @param data 
   */
  private async buildWaterfallUser(data: { waterfallId: string, versionId: string }): Promise<WaterfallState> {
    const waterfall = await this.functions.call<{ waterfallId: string, versionId: string }, string>('buildWaterfall', data);
    return JSON.parse(waterfall, jsonDateReviver); // Cloud functions cannot return Dates
  }

  /**
   * Used only by BlockframesAdmin users that can bypass database rules
   * @param data 
   */
  private async buildWaterfallAdmin(data: { waterfallId: string, versionId: string }): Promise<WaterfallState> {
    const [waterfall, blocks] = await Promise.all([
      this.getValue(data.waterfallId),
      this.blockService.getValue({ waterfallId: data.waterfallId })
    ]);

    const version = waterfall.versions.find(v => v.id === data.versionId);
    const versionBlocks = version.blockIds.map(blockId => blocks.find(b => b.id === blockId));

    return { waterfall: _waterfall(data.waterfallId, versionBlocks), version };
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

  public async initWaterfall(data: WaterfallData, version: Partial<Version>) {
    if (data.waterfall.versions.find(v => v.id === version.id)) throw new Error(`Version "${version.id}" already exists for waterfall "${data.waterfall.id}"`);
    return this._initWaterfall(data, version);
  }

  public async refreshAllWaterfallVersion() {
    // TODO #9520 if rights have a version Id 
  }

  public async refreshWaterfall(data: WaterfallData, versionId: string) {
    const version = data.waterfall.versions.find(v => v.id === versionId);
    await this.removeVersion(data, versionId);
    return this._initWaterfall(data, { id: version.id, name: version.name, description: version.description });
  }

  /**
   * Takes all necessary data to build a waterfall and populates it with ordered blocks
   * @param version 
   * @returns 
   */
  private async _initWaterfall(data: WaterfallData, version: Partial<Version>) {
    const contractActions = contractsToActions(data.contracts, data.terms);
    const investmentActions = investmentsToActions(data.contracts, data.terms);
    const rightActions = rightsToActions(data.rights);
    const incomeActions = incomesToActions(data.contracts, data.incomes, data.waterfall.sources);
    const expenseActions = expensesToActions(data.expenses);
    const paymentActions = statementsToActions(data.statements);

    const groupedActions = groupByDate([
      ...contractActions,
      ...investmentActions,
      ...rightActions,
      ...expenseActions, // Expenses should be added before incomes
      ...incomeActions,
      ...paymentActions
    ]);

    const blocks = await Promise.all(groupedActions.map(group => {
      const blockName = getBlockName(group.date, group.actions);
      return this.blockService.create(data.waterfall.id, blockName, group.actions, group.date);
    }));

    await this.addVersion(data.waterfall, version);

    await this.addBlocksToVersion(data.waterfall, version.id, blocks);
    return data.waterfall;
  }

  public addVersion(waterfall: Waterfall, params: Partial<Version>) {
    const version = createVersion(params);
    waterfall.versions.push(version);
    return this.update(waterfall);
  }

  public async removeVersion(data: WaterfallData, versionId: string) {
    const blockIds = data.waterfall.versions.find(v => v.id === versionId).blockIds;
    data.waterfall.versions = data.waterfall.versions.filter(v => v.id !== versionId);
    data.blocks = data.blocks.filter(b => !blockIds.includes(b.id));
    await this.update(data.waterfall);
    return this.blockService.remove(blockIds, { params: { waterfallId: data.waterfall.id } });
  }

  public async duplicateVersion(waterfall: Waterfall, blocks: Block[], versionId: string) {
    const version = waterfall.versions.find(v => v.id === versionId);
    const blockIds = waterfall.versions.find(v => v.id === versionId).blockIds;
    const versionBlocks = blockIds.map(id => blocks.find(b => b.id === id));

    const newId = `${version.id}-copy`;
    const existingId = waterfall.versions.find(v => v.id === newId);
    if (existingId) throw new Error(`Version "${newId}" already exists for waterfall "${waterfall.id}"`);
    const newVersion = createVersion({
      ...version,
      id: newId,
      name: `${version.name} (copy)`,
      blockIds: [],
      description: `Copied from ${version.id}`
    });

    await this.addVersion(waterfall, newVersion);

    const blocksIds = await Promise.all(versionBlocks.map(b => this.blockService.create(waterfall.id, b.name, Object.values(b.actions), new Date(b.timestamp))));

    await this.addBlocksToVersion(waterfall, newVersion.id, blocksIds);
    return newVersion;
  }

  public addBlocksToVersion(waterfall: Waterfall, versionId: string, blockIds: string[]) {
    const existingVersionIndex = waterfall.versions.findIndex(v => v.id === versionId);
    existingVersionIndex !== -1 ?
      blockIds.forEach(id => waterfall.versions[existingVersionIndex].blockIds.push(id)) :
      waterfall.versions.push(createVersion({ id: versionId, blockIds }));
    return this.update(waterfall);
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

function getBlockName(date: Date, actions: Action[]) {
  const dateStr = `${date.toLocaleDateString()}`;
  const actionsNames = unique(actions.map(a => a.name));

  const paymentActions: ActionName[] = ['payment']; // External payments made after the statement date end
  const statementsActions: ActionName[] = ['expense', 'income', 'payment']; // Expenses, incomes and internal payments
  const contractsActions: ActionName[] = ['contract', 'updateContract', 'invest'];
  const rightsActions: ActionName[] = ['append', 'prepend', 'prependHorizontal', 'appendHorizontal', 'appendVertical', 'prependVertical'];

  if (actionsNames.every(n => paymentActions.includes(n))) return `payments-${dateStr}`;
  if (actionsNames.every(n => statementsActions.includes(n))) return `statements-${dateStr}`;
  if (actionsNames.every(n => contractsActions.includes(n))) return `contracts-${dateStr}`;
  if (actionsNames.every(n => rightsActions.includes(n))) return `rights-${dateStr}`;
  return `mixed-${dateStr}`;
}