import { Injectable } from '@angular/core';
import { WriteOptions } from 'ngfire';
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
  investmentsToActions,
  buildBlock,
  sourcesToAction,
  expenseTypesToAction
} from '@blockframes/model';
import { unique } from '@blockframes/utils/helpers';
import { AuthService } from '@blockframes/auth/service';
import { doc } from 'firebase/firestore';
import { BlockframesCollection } from '@blockframes/utils/abstract-service';
import { waterfall as _waterfall } from './main';
import { BlockService } from './block.service';
import { WaterfallPermissionsService } from './permissions.service';
import type firestore from 'firebase/firestore';

export const fromOrg = (orgId: string) => [where('orgIds', 'array-contains', orgId)];

export interface WaterfallState {
  waterfall: { state: TitleState; history: History[] };
  version: Version;
}

export interface WaterfallData {
  waterfall: Waterfall;
  contracts: WaterfallContract[];
  terms: Term[];
  rights: Right[];
  incomes: Record<string, Income>;
  expenses: Record<string, Expense>;
  statements: Statement[];
}

@Injectable({ providedIn: 'root' })
export class WaterfallService extends BlockframesCollection<Waterfall> {
  readonly path = 'waterfall';

  constructor(
    private authService: AuthService,
    private blockService: BlockService,
    private waterfallPermissionsService: WaterfallPermissionsService,
  ) {
    super();
  }

  protected override fromFirestore(snapshot: DocumentSnapshot<Waterfall>) {
    if (!snapshot.exists()) return undefined;
    const block = super.fromFirestore(snapshot);
    return createWaterfall(block);
  }

  public async buildWaterfall(data: { waterfall: Waterfall, versionId: string, date?: Date }) {
    const blocks = await this.blockService.getValue({ waterfallId: data.waterfall.id });
    const version = data.waterfall.versions.find(v => v.id === data.versionId);
    const versionBlocks = version.blockIds.map(blockId => blocks.find(b => b.id === blockId));
    const build = buildWaterfall(data.waterfall.id, version, versionBlocks);
    return waterfallToDate(build, data.date);
  }

  onUpdate(waterfall: Waterfall, { write }: WriteOptions) {
    const waterfallRef = doc(this.db, `${this.path}/${waterfall.id}`);
    write.update(waterfallRef,
      '_meta.updatedBy', this.authService.uid,
      '_meta.updatedAt', new Date(),
    );
  }

  public async create(id: string, orgIds: string[]) {
    const createdBy = this.authService.uid;
    const waterfall = createWaterfall({
      _meta: createDocumentMeta({ createdBy }),
      id,
      orgIds,
    });

    await this.runTransaction(async (tx) => {
      await this.add(waterfall, { write: tx });
    });
    return waterfall;
  }

  onCreate(waterfall: Waterfall, { write }: WriteOptions) {
    const ref = this.getRef(waterfall.id);
    write.update(ref, '_meta.createdAt', new Date());
    for (const orgId of waterfall.orgIds) {
      this.waterfallPermissionsService.create(
        waterfall.id,
        write as firestore.Transaction,
        orgId,
        true
      );
    }
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
    const blocks = buildBlocks(data, this.authService.uid, version.id);
    const blockIds = await this.blockService.add(blocks, { params: { waterfallId: data.waterfall.id } });

    await this.addVersion(data.waterfall, version);

    await this.addBlocksToVersion(data.waterfall, version.id, blockIds);
    return data.waterfall;
  }

  /**
   * Runs a simulation of the waterfall without storing data in the database
   * @param waterfall 
   * @param blocks 
   * @param versionId
   * @param date 
   * @returns 
   */
  public simulateWaterfall(data: WaterfallData, versionId?: string, date?: Date) {
    const version = createVersion({ id: 'simulation', name: 'Simulation' });
    const blocks = buildBlocks(data, this.authService.uid, versionId, { simulation: true });
    const simulation = buildWaterfall('simulated-waterfall', version, blocks);
    return waterfallToDate(simulation, date);
  }

  public addVersion(waterfall: Waterfall, params: Partial<Version>) {
    const version = createVersion(params);
    waterfall.versions.push(version);
    return this.update(waterfall);
  }

  public async removeVersion(data: WaterfallData, versionId: string) {
    const blockIds = data.waterfall.versions.find(v => v.id === versionId).blockIds;
    data.waterfall.versions = data.waterfall.versions.filter(v => v.id !== versionId);
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

    const duplicatedBlocks = versionBlocks.map(b => buildBlock(b.name, Object.values(b.actions), new Date(b.timestamp), this.authService.uid));
    const blocksIds = await this.blockService.add(duplicatedBlocks, { params: { waterfallId: waterfall.id } });

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

  public async updateSource(waterfallId: string, newSource: WaterfallSource, options?: WriteOptions) {
    const waterfall = await this.getValue(waterfallId);
    const sourceIndex = waterfall.sources.findIndex(s => s.id === newSource.id);
    if (sourceIndex === -1) return; // if source does not exist, do nothing
    waterfall.sources[sourceIndex] = newSource;
    return this.update(waterfallId, { id: waterfallId, sources: waterfall.sources }, options);
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

function waterfallToDate(build: WaterfallState, date?: Date) {
  if (date) { // Stops waterfall at a given date
    build.waterfall.history = build.waterfall.history.filter(h => {
      const stateDate = new Date(h.date);
      const compareDate = date;
      stateDate.setHours(0, 0, 0, 0);
      compareDate.setHours(0, 0, 0, 0);
      return stateDate.getTime() <= compareDate.getTime();
    });
    build.waterfall.state = build.waterfall.history[build.waterfall.history.length - 1];
  }
  return build;
}

function groupActions(data: WaterfallData, versionId: string, isSimulation = false) {
  // @dev "sourcesToAction" may be activated for real waterfall also (generate bad display for graph generated with G6 but not with new one)
  const sourceActions = isSimulation ? sourcesToAction(data.waterfall.sources) : [];
  const expenseTypesActions = expenseTypesToAction(Object.values(data.waterfall.expenseTypes).flat(), versionId);
  const contractActions = contractsToActions(data.contracts, data.terms);
  const investmentActions = investmentsToActions(data.contracts, data.terms);
  const rightActions = rightsToActions(data.rights);
  const incomeActions = incomesToActions(data.contracts, Object.values(data.incomes), data.waterfall.sources, data.statements);
  const expenseActions = expensesToActions(Object.values(data.expenses));
  const paymentActions = statementsToActions(data.statements);

  const groupedActions = groupByDate([
    ...sourceActions,
    ...expenseTypesActions,
    ...contractActions,
    ...investmentActions,
    ...rightActions,
    ...expenseActions, // Expenses should be added before incomes
    ...incomeActions,
    ...paymentActions
  ]);

  return groupedActions;
}

function buildBlocks(data: WaterfallData, createdBy: string, versionId: string, options?: { simulation: boolean }) {
  const groupedActions = groupActions(data, versionId, options?.simulation);

  return groupedActions.map(group => {
    const blockName = getBlockName(group.date, group.actions);
    return buildBlock(blockName, group.actions, group.date, createdBy);
  });
}

/**
 * Used only by BlockframesAdmin users that can bypass database rules
 * @param data 
 */
function buildWaterfall(waterfallId: string, version: Version, blocks: Block[]): WaterfallState {
  return { waterfall: _waterfall(waterfallId, blocks), version };
}