
import { WriteBatch } from 'firebase/firestore';
import { BehaviorSubject, Subscription, combineLatest, map, tap } from 'rxjs';
import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';

import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import {
  Right,
  Version,
  Condition,
  createRight,
  WaterfallSource,
  isConditionGroup,
  getContractsWith,
  isDefaultVersion,
  waterfallSources,
  WaterfallContract,
  getDefaultVersionId,
  WaterfallRightholder,
  createWaterfallSource,
} from '@blockframes/model';
import { boolean } from '@blockframes/utils/decorators/decorators';
import { GraphService } from '@blockframes/ui/graph/graph.service';
import { CardModalComponent } from '@blockframes/ui/card-modal/card-modal.component';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';

import { RightService } from '../../right.service';
import { WaterfallService } from '../../waterfall.service';
import { createRightForm, setRightFormValue } from '../forms/right-form/right-form';
import { createSourceForm, setSourceFormValue } from '../forms/source-form/source-form';
import { DashboardWaterfallShellComponent } from '../../dashboard/shell/shell.component';
import { WaterfallDeleteRightModalComponent } from './delete-right-modal/delete-right-modal.component';
import { Arrow, Node, computeDiff, createChild, createSibling, createStep, deleteStep, fromGraph, toGraph, updateParents } from './layout';


@Component({
  selector: 'waterfall-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WaterfallGraphComponent implements OnInit, OnDestroy {

  @Input() @boolean set editMode(value: boolean) {
    if (value === null) return;
    this._editMode = value;
    this.showEdit = value;
  }
  get editMode() { return this._editMode; }
  private _editMode = true;

  showEdit = true;

  rights: Right[];
  waterfall = this.shell.waterfall;
  private version: Version;
  isDefaultVersion: boolean;
  private defaultVersionId: string;
  canUpdateGraph = true;
  sources: WaterfallSource[];
  rightholders: WaterfallRightholder[];

  @ViewChild(CardModalComponent, { static: true }) cardModal: CardModalComponent;

  selected$ = new BehaviorSubject<string>('');
  isSourceSelected = false;

  nodes$ = new BehaviorSubject<Node[]>([]);
  arrows$ = new BehaviorSubject<Arrow[]>([]);

  rightForm = createRightForm();
  sourceForm = createSourceForm();

  rightholderNames$ = new BehaviorSubject<string[]>([]);
  relevantContracts$ = new BehaviorSubject<WaterfallContract[]>([]);

  subscription: Subscription;

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private service: GraphService,
    private rightService: RightService,
    private waterfallService: WaterfallService,
    private shell: DashboardWaterfallShellComponent,
  ) { }

  ngOnInit() {
    this.subscription = combineLatest([
      this.shell.rights$,
      this.shell.waterfall$,
      this.shell.versionId$.pipe(tap(_ => this.unselect())),
      this.shell.statements$.pipe(map(statements => statements.filter(s => s.status === 'reported'))),
    ]).subscribe(([rights, waterfall, versionId, statements]) => {
      this.rights = rights;
      this.version = waterfall.versions.find(v => v.id === versionId);
      this.sources = waterfallSources(waterfall, this.version?.id);
      this.rightholders = waterfall.rightholders;
      this.rightholderNames$.next(this.rightholders.map(r => r.name));
      this.isDefaultVersion = isDefaultVersion(waterfall, versionId);
      this.defaultVersionId = getDefaultVersionId(waterfall);

      // Enable or disable possible updates
      this.rightForm.enable();
      this.sourceForm.enable();
      this.canUpdateGraph = true;
      if ((this.version?.id && !this.isDefaultVersion && !this.version.standalone) || statements.length > 0) {
        this.rightForm.disable();
        if(statements.length  > 0 ) {
          this.rightForm.controls.percent.enable();
          this.rightForm.controls.steps.enable();
        }
        this.sourceForm.disable();
        this.canUpdateGraph = false;
      }
      this.layout();
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  async select(id: string) {
    this.selected$.next(id);

    const source = this.sources.find(source => source.id === id);
    if (source) {
      this.isSourceSelected = true;
      setSourceFormValue(this.sourceForm, source);
      return;
    }

    const right = this.rights.find(right => right.id === id);
    if (right) {
      this.isSourceSelected = false;
      let steps: Condition[][] = [];

      const producer = this.rightholders.find(r => r.roles.includes('producer'));
      if (right.rightholderId && right.rightholderId !== producer?.id) {
        const contracts = await this.shell.contracts();
        this.relevantContracts$.next(getContractsWith([right.rightholderId, producer?.id], contracts));
      } else {
        this.relevantContracts$.next([]);
      }

      if (right.type === 'vertical') {
        const members = this.rights.filter(r => r.groupId === right.id).sort((a, b) => a.order - b.order);
        steps = members.map(member => member.conditions?.conditions.filter(c => !isConditionGroup(c)) as Condition[] ?? []);
      } else {
        steps[0] = right.conditions?.conditions.filter(c => !isConditionGroup(c)) as Condition[] ?? [];
      }
      const org = this.rightholders.find(r => r.id === right.rightholderId)?.name ?? '';;
      const parents = this.nodes$.getValue().filter(node => node.children.includes(right.groupId || id)); // do not use ?? instead of ||, it will break since '' can be considered truthy
      setRightFormValue(this.rightForm, { ...right, rightholderId: org, nextIds: parents.map(parent => parent.id) }, steps);
    }
  }

  unselect() {
    this.selected$.next('');
  }

  async updateRight() {
    const rightId = this.selected$.getValue();

    const graph = this.nodes$.getValue();
    updateParents(rightId, this.rightForm.controls.parents.value, graph);
    const newGraph = fromGraph(graph, this.version);
    const changes = computeDiff({ rights: this.rights, sources: this.sources }, newGraph);
    const right = changes.updated.rights.find(right => right.id === rightId);
    right.type = this.rightForm.controls.type.value;
    right.name = this.rightForm.controls.name.value;
    right.percent = this.rightForm.controls.percent.value;
    right.contractId = this.rightForm.controls.contract.value;
    right.rightholderId = this.rightholders.find(r => r.name === this.rightForm.controls.org.value)?.id ?? '';

    if (right.type === 'vertical') {
      const steps = changes.updated.rights.filter(r => r.groupId === right.id);
      steps.forEach(step => {
        step.rightholderId = right.rightholderId;
        step.contractId = right.contractId;
      });
      this.rightForm.controls.steps.value.forEach((conditions, index) => {
        steps[index].conditions = { operator: 'AND', conditions: conditions };
      });
    } else {
      right.conditions = { operator: 'AND', conditions: this.rightForm.controls.steps.value[0] };
    }

    if (this.version?.id) {
      for (const r of changes.updated.rights) {
        r.version[this.version.id].percent = r.percent;
        r.version[this.version.id].conditions = r.conditions;
        if (!this.isDefaultVersion && !this.version.standalone) {
          r.percent = r.version[this.defaultVersionId].percent;
          r.conditions = r.version[this.defaultVersionId].conditions;
        }
      }
    }

    const write = this.waterfallService.batch();
    await Promise.all([
      this.rightService.add(changes.created.rights, { params: { waterfallId: this.waterfall.id }, write }),
      this.rightService.update(changes.updated.rights, { params: { waterfallId: this.waterfall.id }, write }),
      this.rightService.remove(changes.deleted.rights.map(r => r.id), { params: { waterfallId: this.waterfall.id }, write }),
      this.updateSources(newGraph.sources, write),
    ]);
    await write.commit();
  }

  updateSource() {
    const sourceId = this.selected$.getValue();
    const source = this.sources.find(source => source.id === sourceId);
    if (!source) return;

    source.name = this.sourceForm.controls.name.value;
    source.medias = this.sourceForm.controls.medias.value;
    source.territories = this.sourceForm.controls.territories.value;

    return this.waterfallService.updateSource(this.waterfall.id, source);
  }

  async layout() {
    const { nodes, arrows, bounds } = await toGraph(this.rights, this.sources);
    this.service.updateBounds(bounds);
    this.nodes$.next(nodes);
    this.arrows$.next(arrows);
  }

  toggleEdit() {
    this.showEdit = !this.showEdit;
  }

  async addSibling(id: string) {
    if (!this.canUpdateGraph) {
      this.snackBar.open('Operation not permitted on this version. Switch to default', 'close', { duration: 5000 });
      return;
    }
    const graph = this.nodes$.getValue();
    createSibling(id, graph);
    const newGraph = fromGraph(graph, this.version);
    const changes = computeDiff({ rights: this.rights, sources: this.sources }, newGraph);

    const write = this.waterfallService.batch();
    await Promise.all([
      this.rightService.add(changes.created.rights, { params: { waterfallId: this.waterfall.id }, write }),
      this.rightService.update(changes.updated.rights, { params: { waterfallId: this.waterfall.id }, write }),
      this.rightService.remove(changes.deleted.rights.map(r => r.id), { params: { waterfallId: this.waterfall.id }, write }),
      this.updateSources(newGraph.sources, write),
    ]);
    return write.commit();
  }

  async addChild(id: string) {
    if (!this.canUpdateGraph) {
      this.snackBar.open('Operation not permitted on this version. Switch to default', 'close', { duration: 5000 });
      return;
    }
    const graph = this.nodes$.getValue();
    createChild(id, graph);
    const newGraph = fromGraph(graph, this.version);
    const changes = computeDiff({ rights: this.rights, sources: this.sources }, newGraph);

    const write = this.waterfallService.batch();
    await Promise.all([
      this.rightService.add(changes.created.rights, { params: { waterfallId: this.waterfall.id }, write }),
      this.rightService.update(changes.updated.rights, { params: { waterfallId: this.waterfall.id }, write }),
      this.rightService.remove(changes.deleted.rights.map(r => r.id), { params: { waterfallId: this.waterfall.id }, write }),
      this.updateSources(newGraph.sources, write),
    ]);
    return write.commit();
  }

  async createNewStep() {
    if (!this.canUpdateGraph) {
      this.snackBar.open('Operation not permitted on this version. Switch to default', 'close', { duration: 5000 });
      return;
    }
    const graph = this.nodes$.getValue();
    const rightId = this.selected$.getValue();
    createStep(rightId, graph);
    const newGraph = fromGraph(graph, this.version);
    const changes = computeDiff({ rights: this.rights, sources: this.sources }, newGraph);

    const write = this.waterfallService.batch();
    await Promise.all([
      this.rightService.add(changes.created.rights, { params: { waterfallId: this.waterfall.id }, write }),
      this.rightService.update(changes.updated.rights, { params: { waterfallId: this.waterfall.id }, write }),
      this.rightService.remove(changes.deleted.rights.map(r => r.id), { params: { waterfallId: this.waterfall.id }, write }),
      this.updateSources(newGraph.sources, write),
    ]);
    return write.commit();
  }

  async deleteStep(index: number) {
    if (!this.canUpdateGraph) {
      this.snackBar.open('Operation not permitted on this version. Switch to default', 'close', { duration: 5000 });
      return;
    }
    const graph = this.nodes$.getValue();
    const rightId = this.selected$.getValue();
    deleteStep(rightId, index, graph);
    console.log(graph);
    const newGraph = fromGraph(graph, this.version);
    console.log(newGraph);
    const changes = computeDiff({ rights: this.rights, sources: this.sources }, newGraph);
    console.log(changes);

    const write = this.waterfallService.batch();
    await Promise.all([
      this.rightService.add(changes.created.rights, { params: { waterfallId: this.waterfall.id }, write }),
      this.rightService.update(changes.updated.rights, { params: { waterfallId: this.waterfall.id }, write }),
      this.rightService.remove(changes.deleted.rights.map(r => r.id), { params: { waterfallId: this.waterfall.id }, write }),
      this.updateSources(newGraph.sources, write),
    ]);
    return write.commit();
  }

  async createNewSource() {
    if (!this.canUpdateGraph) {
      this.snackBar.open('Operation not permitted on this version. Switch to default', 'close', { duration: 5000 });
      return;
    }
    const newSource = createWaterfallSource({
      id: this.waterfallService.createId(),
      name: `Source ${this.sources.length + 1}`,
    });

    if (this.version?.standalone) {
      newSource.version[this.version.id] = { standalone: true };
    }

    await this.waterfallService.addSource(this.waterfall, newSource);
    this.select(newSource.id);
  }

  async createNewRight() {
    if (!this.canUpdateGraph) {
      this.snackBar.open('Operation not permitted on this version. Switch to default', 'close', { duration: 5000 });
      return;
    }
    const newRight = createRight({
      name: `Right ${this.rights.length + 1}`,
      percent: 0,
    });

    if (this.version?.standalone) {
      newRight.version[this.version.id] = { standalone: true };
    }

    const id = await this.rightService.add(newRight, { params: { waterfallId: this.waterfall.id } });
    this.select(id);
  }

  async delete(rightId?: string) {
    if (!this.canUpdateGraph) {
      this.snackBar.open('Operation not permitted on this version. Switch to default', 'close', { duration: 5000 });
      return;
    }

    const id = rightId ?? this.selected$.getValue();
    const right = this.rights.find(right => right.id === id);
    const source = this.sources.find(source => source.id === id);

    this.dialog.open(
      WaterfallDeleteRightModalComponent,
      {
        data: createModalData({
          rightName: right?.name ?? source?.name ?? '',
          onConfirm: () => this.handleDeletion(id),
        }),
      },
    );
  }

  private async handleDeletion(rightId?: string) {
    const id = rightId ?? this.selected$.getValue();
    const right = this.rights.find(right => right.id === id);
    const source = this.sources.find(source => source.id === id);

    if (!right && !source) return;

    if (right) {
      if (right.groupId) {
        const group = this.rights.find(r => r.id === right.groupId);

        const members = this.rights.filter(r => r.groupId === group.id && r.id !== right.id);

        // if the group only has one member left, delete the group
        if (members.length === 1) {

          const write = this.waterfallService.batch();

          // remove this group from its sources parent's children list (destinationId)
          const parentSource = this.sources.find(s => s.destinationId === group.id);
          if (parentSource) {
            parentSource.destinationId = members[0].id;
            await this.waterfallService.updateSource(this.waterfall.id, parentSource, { write });
          };

          members[0].groupId = '';
          members[0].nextIds = [...group.nextIds];
          const rightsToUpdate = [members[0]];

          // remove this group from its children's parent list (nextIds)
          for (const r of this.rights) {
            if (r.nextIds.includes(group.id)) {
              const nextIds = r.nextIds.filter(nextId => nextId !== group.id);
              nextIds.push(members[0].id);
              rightsToUpdate.push({ ...r, nextIds });
            }
          };

          await Promise.all([
            this.rightService.update(rightsToUpdate, { params: { waterfallId: this.waterfall.id }, write }),
            this.rightService.remove([id, group.id], { params: { waterfallId: this.waterfall.id }, write }),
          ]);
          await write.commit();
          return;
        }

        // delete the right and update the order (and name) of the remaining members
        if (group.type === 'vertical') {
          const vMembers = this.rights.filter(r => r.groupId === group.id).sort((a, b) => a.order - b.order);
          const indexToRemove = vMembers.findIndex(r => r.id === id);
          vMembers.splice(indexToRemove, 1);
          vMembers.forEach((r, index) => {
            r.order = index;
            r.name = `Step ${index + 1}`;
          });

          const write = this.waterfallService.batch();
          const promises: Promise<unknown>[] = [];
          vMembers.forEach(r => promises.push(this.rightService.update(r.id, r, { params: { waterfallId: this.waterfall.id }, write })));
          promises.push(this.rightService.remove(id, { params: { waterfallId: this.waterfall.id }, write }));
          await Promise.all(promises);
          await write.commit();
          return;
        }
      }

      const write = this.waterfallService.batch();
      const promises: Promise<unknown>[] = [];

      // remove this right from its children's parent list (nextIds)
      for (const r of this.rights) {
        if (r.nextIds.includes(id)) {
          const nextIds = r.nextIds.filter(nextId => nextId !== id);
          promises.push(this.rightService.update(r.id, { ...r, nextIds }, { params: { waterfallId: this.waterfall.id }, write }));
        }
      }

      // remove this right from its sources parent's children list (destinationId)
      for (const s of this.sources) {
        if (s.destinationId === id) {
          s.destinationId = '';
          promises.push(this.waterfallService.updateSource(this.waterfall.id, s, { write }));
        }
      }

      // then delete this right
      promises.push(this.rightService.remove(id, { params: { waterfallId: this.waterfall.id }, write }));
      await Promise.all(promises);
      await write.commit();

    } else {
      if (source.destinationId) {
        const rightChild = this.rights.find(right => right.id === source.destinationId);
        if (rightChild) {
          rightChild.nextIds = rightChild.nextIds.filter(id => id !== source.id);
          await this.rightService.update(rightChild.id, rightChild, { params: { waterfallId: this.waterfall.id } });
        }
      }
      await this.waterfallService.removeSources(this.waterfall.id, [id]);
    }

    this.select('');
  }

  private async updateSources(sources: WaterfallSource[], write?: WriteBatch) {
    if (!this.version || !this.version.standalone) {
      const standaloneSources = this.shell.waterfall.sources.filter(s => s.version && Object.values(s.version).some(v => v.standalone));
      return this.waterfallService.update(this.waterfall.id, { id: this.waterfall.id, sources: [...sources, ...standaloneSources] }, { write });
    } else {
      const waterfallSources = this.version?.id ? this.shell.waterfall.sources.filter(s => !s.version || !s.version[this.version.id]) : [];
      return this.waterfallService.update(this.waterfall.id, { id: this.waterfall.id, sources: [...sources, ...waterfallSources] }, { write });
    }
  }
}
