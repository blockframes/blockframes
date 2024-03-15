import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Intercom } from 'ng-intercom';
import { WriteBatch } from 'firebase/firestore';
import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit, Optional, Pipe, PipeTransform, ViewChild } from '@angular/core';
import { BehaviorSubject, Subscription, combineLatest, map, tap } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  Right,
  Version,
  toLabel,
  Condition,
  RightType,
  rightTypes,
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
import { ConfirmInputComponent } from '@blockframes/ui/confirm-input/confirm-input.component';
import { RightService } from '../../right.service';
import { WaterfallService } from '../../waterfall.service';
import { createRightForm, setRightFormValue } from '../forms/right-form/right-form';
import { createSourceForm, setSourceFormValue } from '../forms/source-form/source-form';
import { DashboardWaterfallShellComponent } from '../../dashboard/shell/shell.component';
import { Arrow, Node, computeDiff, createChild, createSibling, createStep, deleteStep, fromGraph, toGraph, updateParents } from './layout';

@Component({
  selector: 'waterfall-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WaterfallGraphComponent implements OnInit, OnDestroy {

  @Input() @boolean public readonly = false;
  public showEditPanel = this.shell.canBypassRules;
  public waterfall = this.shell.waterfall;
  public isDefaultVersion: boolean;
  public canUpdateGraph = true;
  public canUpdateConditions = true;
  public selected$ = new BehaviorSubject<string>('');
  public isSourceSelected = false;
  public nodes$ = new BehaviorSubject<Node[]>([]);
  public arrows$ = new BehaviorSubject<Arrow[]>([]);
  public rightForm = createRightForm();
  public sourceForm = createSourceForm();
  public rightholderControl = new FormControl<string>('');
  public rightholderNames$ = new BehaviorSubject<string[]>([]);
  public relevantContracts$ = new BehaviorSubject<WaterfallContract[]>([]);
  public rights: Right[];

  private waterfallId = this.shell.waterfall.id;
  private sources: WaterfallSource[];
  private defaultVersionId: string;
  private producer = this.shell.waterfall.rightholders.find(r => r.roles.includes('producer'));
  private version: Version;
  private subscriptions: Subscription[] = [];
  private rightholders: WaterfallRightholder[];
  private contracts: WaterfallContract[];

  @ViewChild(CardModalComponent, { static: true }) cardModal: CardModalComponent;

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private service: GraphService,
    private rightService: RightService,
    private waterfallService: WaterfallService,
    private shell: DashboardWaterfallShellComponent,
    @Optional() private intercom: Intercom,
    private router: Router,
  ) { }

  ngOnInit() {
    if (this.readonly) this.showEditPanel = false;
    if (!this.producer) {
      this.snackBar.open(`${toLabel('producer', 'rightholderRoles')} is not defined.`, this.shell.canBypassRules ? 'WATERFALL MANAGEMENT' : 'ASK FOR HELP', { duration: 5000 })
        .onAction()
        .subscribe(() => {
          if (this.shell.canBypassRules) {
            this.router.navigate(['c/o/dashboard/title', this.waterfallId, 'init']);
          } else {
            this.intercom.show(`${toLabel('producer', 'rightholderRoles')} is not defined in the waterfall "${this.shell.movie.title.international}"`);
          }
        });
    }
    this.subscriptions.push(combineLatest([
      this.shell.rights$,
      this.shell.waterfall$,
      this.shell.versionId$.pipe(tap(_ => this.unselect())),
      this.shell.statements$.pipe(map(statements => statements.filter(s => s.status === 'reported'))),
      this.shell.contracts$,
      this.shell.hiddenRightHolderIds$,
    ]).subscribe(([rights, waterfall, versionId, reportedStatements, contracts, hiddenRightHolderIds]) => {
      this.rights = rights; // TODO #9706 filtered rights if needed
      this.contracts = contracts;
      this.version = waterfall.versions.find(v => v.id === versionId);
      this.sources = waterfallSources(waterfall, this.version?.id); // TODO #9706 filtered sources if needed
      this.rightholders = waterfall.rightholders;
      this.rightholderNames$.next(this.rightholders.map(r => r.name));
      this.isDefaultVersion = isDefaultVersion(waterfall, versionId);
      this.defaultVersionId = getDefaultVersionId(waterfall);

      // Enable or disable possible updates
      this.rightForm.enable();
      this.sourceForm.enable();
      this.rightholderControl.enable();
      this.canUpdateGraph = !this.readonly;
      this.canUpdateConditions = true;
      if ((this.version?.id && !this.isDefaultVersion && !this.version.standalone) || reportedStatements.length > 0) {
        this.rightForm.disable();
        this.rightholderControl.disable();
        this.canUpdateConditions = false;
        if (reportedStatements.length === 0) {
          this.rightForm.controls.percent.enable();
          this.rightForm.controls.steps.enable();
          this.canUpdateConditions = true;
        }
        this.sourceForm.disable();
        this.canUpdateGraph = false;
      }
      this.layout(hiddenRightHolderIds);
    }));
    this.subscriptions.push(this.rightForm.controls.org.valueChanges.subscribe(org => {
      this.updateRightName(org, undefined);
      const rightholder = this.rightholders.find(r => r.name === org);
      this.rightholderControl.setValue(rightholder?.name);
      const producer = this.rightholders.find(r => r.roles.includes('producer'));
      if (rightholder && rightholder.id !== producer?.id) {
        this.relevantContracts$.next(getContractsWith([rightholder.id, producer?.id], this.contracts));
      } else {
        this.relevantContracts$.next([]);
      }
    }));
    this.subscriptions.push(this.rightForm.controls.type.valueChanges.subscribe(type => this.updateRightName(undefined, type)));
    this.subscriptions.push(this.rightholderControl.valueChanges.subscribe(name => {
      const rightholder = this.rightholders.find(r => r.name === name);
      if (rightholder) {
        if (this.rightForm.controls.org.value !== rightholder.name) this.rightForm.controls.org.setValue(rightholder.name);
      } else if (name !== '') {
        this.rightholderControl.setErrors({ invalidValue: true });
      }
    }));
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  private updateRightName(org?: string, type?: RightType) {
    const right = this.rightForm.value;
    const o = org ?? right.org;
    const t = rightTypes[type ?? right.type];
    if (!t || !o) return;
    if (`${o} - ${t}` === right.name) return;
    if (!right.name || right.name === 'New right' || right.name.includes(' - ')) {
      this.rightForm.controls.name.setValue(`${o} - ${t}`);
    }
  }

  openIntercom() {
    return this.intercom.show('I need help to create a waterfall');
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
        this.relevantContracts$.next(getContractsWith([right.rightholderId, producer?.id], this.contracts));
      } else {
        this.relevantContracts$.next([]);
      }

      let rightholderId = '';

      let type = right.type;

      if (right.type === 'vertical') {
        const members = this.rights.filter(r => r.groupId === right.id).sort((a, b) => a.order - b.order);
        steps = members.map(member => member.conditions?.conditions.filter(c => !isConditionGroup(c)) as Condition[] ?? []);
        rightholderId = members[0].rightholderId;
        type = members[0].type;
        right.contractId = members[0].contractId;
      } else if (right.type === 'horizontal') {
        rightholderId = right.blameId;
      } else {
        steps[0] = right.conditions?.conditions.filter(c => !isConditionGroup(c)) as Condition[] ?? [];
        rightholderId = right.rightholderId;
      }

      const rightholderName = this.rightholders.find(r => r.id === rightholderId)?.name ?? '';
      const parents = this.nodes$.getValue().filter(node => node.children.includes(right.groupId || id)); // do not use ?? instead of ||, it will break since '' can be considered truthy
      setRightFormValue(this.rightForm, { ...right, type, rightholderId: rightholderName, nextIds: parents.map(parent => parent.id) }, steps);
    }
  }

  unselect() {
    this.selected$.next('');
  }

  async updateRight() {
    const rightholderName = this.rightForm.controls.org.value;
    const rightholder = this.rightholders.find(r => r.name === rightholderName);
    if (!rightholder) {
      this.snackBar.open('Please provide a valid Right Holder name', 'close', { duration: 3000 });
      return;
    }

    if (this.relevantContracts$.value.length === 0) this.rightForm.controls.contract.setValue('');

    const producer = this.rightholders.find(r => r.roles.includes('producer'));
    if (producer?.id !== rightholder.id && this.rightForm.controls.type.value !== 'horizontal' && !this.rightForm.controls.contract.value) {
      this.snackBar.open('Please provide the contract associated to this Receipt Share', 'close', { duration: 3000 });
      return;
    }

    const rightId = this.selected$.getValue();

    const graph = this.nodes$.getValue();
    updateParents(rightId, this.rightForm.controls.parents.value, graph, this.producer?.id);
    const newGraph = fromGraph(graph, this.version);
    const changes = computeDiff({ rights: this.rights, sources: this.sources }, newGraph);
    const right = changes.updated.rights.find(right => right.id === rightId);
    const existingRight = this.rights.find(r => r.id === rightId);
    right.type = existingRight.type === 'vertical' ? 'vertical' : this.rightForm.controls.type.value;
    right.name = this.rightForm.controls.name.value;
    right.percent = this.rightForm.controls.percent.value;
    right.contractId = this.rightForm.controls.contract.value;

    if (right.type !== 'horizontal') {
      right.rightholderId = this.rightholders.find(r => r.name === this.rightForm.controls.org.value)?.id ?? '';
    } else {
      right.blameId = this.rightholders.find(r => r.name === this.rightForm.controls.org.value)?.id ?? '';
    }

    if (right.type === 'vertical') {
      const steps = changes.updated.rights.filter(r => r.groupId === right.id);
      steps.forEach(step => {
        step.type = this.rightForm.controls.type.value;
        step.rightholderId = right.rightholderId;
        step.contractId = right.contractId;
      });
      delete right.rightholderId;
      delete right.contractId;
      this.rightForm.controls.steps.value.forEach((conditions, index) => {
        steps[index].conditions = { operator: 'AND', conditions: conditions };
      });
    } else if (right.type !== 'horizontal') {
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
      this.rightService.add(changes.created.rights, { params: { waterfallId: this.waterfallId }, write }),
      this.rightService.update(changes.updated.rights, { params: { waterfallId: this.waterfallId }, write }),
      this.rightService.remove(changes.deleted.rights.map(r => r.id), { params: { waterfallId: this.waterfallId }, write }),
      this.updateSources(newGraph.sources, write),
    ]);
    await write.commit();

    if (right.type === 'horizontal') {
      this.snackBar.open('Group Details saved', 'close', { duration: 3000 });
    } else {
      this.snackBar.open('Receipt Share saved', 'close', { duration: 3000 });
    }
  }

  updateSource() {
    const sourceId = this.selected$.getValue();
    const source = this.sources.find(source => source.id === sourceId);
    if (!source) return;

    source.name = this.sourceForm.controls.name.value;
    source.medias = this.sourceForm.controls.medias.value;
    source.territories = this.sourceForm.controls.territories.value;

    return this.waterfallService.updateSource(this.waterfallId, source);
  }

  async layout(hiddenRightHolderIds: string[]) {
    const { nodes, arrows, bounds } = await toGraph(this.rights, this.sources, hiddenRightHolderIds);
    this.service.updateBounds(bounds);
    this.nodes$.next(nodes);
    this.arrows$.next(arrows);
  }

  toggleEditPanel() {
    this.showEditPanel = !this.showEditPanel;
  }

  async addSibling(id: string) {
    if (!this.canUpdateGraph) {
      this.snackBar.open('Operation not permitted on this version. Switch to default', 'close', { duration: 5000 });
      return;
    }
    const graph = this.nodes$.getValue();
    createSibling(id, graph, this.producer?.id);
    const newGraph = fromGraph(graph, this.version);
    const changes = computeDiff({ rights: this.rights, sources: this.sources }, newGraph);

    const write = this.waterfallService.batch();
    await Promise.all([
      this.rightService.add(changes.created.rights, { params: { waterfallId: this.waterfallId }, write }),
      this.rightService.update(changes.updated.rights, { params: { waterfallId: this.waterfallId }, write }),
      this.rightService.remove(changes.deleted.rights.map(r => r.id), { params: { waterfallId: this.waterfallId }, write }),
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
    createChild(id, graph, this.producer?.id);
    const newGraph = fromGraph(graph, this.version);
    const changes = computeDiff({ rights: this.rights, sources: this.sources }, newGraph);

    const write = this.waterfallService.batch();
    await Promise.all([
      this.rightService.add(changes.created.rights, { params: { waterfallId: this.waterfallId }, write }),
      this.rightService.update(changes.updated.rights, { params: { waterfallId: this.waterfallId }, write }),
      this.rightService.remove(changes.deleted.rights.map(r => r.id), { params: { waterfallId: this.waterfallId }, write }),
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
      this.rightService.add(changes.created.rights, { params: { waterfallId: this.waterfallId }, write }),
      this.rightService.update(changes.updated.rights, { params: { waterfallId: this.waterfallId }, write }),
      this.rightService.remove(changes.deleted.rights.map(r => r.id), { params: { waterfallId: this.waterfallId }, write }),
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
    const newGraph = fromGraph(graph, this.version);
    const changes = computeDiff({ rights: this.rights, sources: this.sources }, newGraph);

    const write = this.waterfallService.batch();
    await Promise.all([
      this.rightService.add(changes.created.rights, { params: { waterfallId: this.waterfallId }, write }),
      this.rightService.update(changes.updated.rights, { params: { waterfallId: this.waterfallId }, write }),
      this.rightService.remove(changes.deleted.rights.map(r => r.id), { params: { waterfallId: this.waterfallId }, write }),
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
      name: 'New source',
    });

    if (this.version?.standalone) {
      newSource.version[this.version.id] = { standalone: true };
    }

    await this.waterfallService.addSource(this.shell.waterfall, newSource);
    this.select(newSource.id);
  }

  async createNewRight() {
    if (!this.canUpdateGraph) {
      this.snackBar.open('Operation not permitted on this version. Switch to default', 'close', { duration: 5000 });
      return;
    }
    const newRight = createRight({
      name: 'New right',
      percent: 0,
    });

    if (this.version?.standalone) {
      newRight.version[this.version.id] = { standalone: true };
    }

    const id = await this.rightService.add(newRight, { params: { waterfallId: this.waterfallId } });
    this.select(id);
  }

  async delete(rightId?: string) {
    if (!this.canUpdateGraph) {
      this.snackBar.open('Operation not permitted on this version. Switch to default', 'close', { duration: 5000 });
      return;
    }

    const id = rightId ?? this.selected$.getValue();
    const right = this.rights.find(right => right.id === id);

    this.dialog.open(ConfirmInputComponent, {
      data: createModalData({
        title: `Delete ${right ? 'Receipt Shares' : 'Source'}`,
        subtitle: `Pay attention, if you delete the following ${right ? 'Receipt Shares' : 'Source'}, it will have an impact on conditions and the whole Waterfall.`,
        text: `Please type "DELETE" to confirm.`,
        confirmationWord: 'DELETE',
        confirmButtonText: `Delete ${right ? 'Receipt Shares' : 'Source'}`,
        onConfirm: () => this.handleDeletion(id),
      })
    });
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
            await this.waterfallService.updateSource(this.waterfallId, parentSource, { write });
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
            this.rightService.update(rightsToUpdate, { params: { waterfallId: this.waterfallId }, write }),
            this.rightService.remove([id, group.id], { params: { waterfallId: this.waterfallId }, write }),
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
          vMembers.forEach(r => promises.push(this.rightService.update(r.id, r, { params: { waterfallId: this.waterfallId }, write })));
          promises.push(this.rightService.remove(id, { params: { waterfallId: this.waterfallId }, write }));
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
          promises.push(this.rightService.update(r.id, { ...r, nextIds }, { params: { waterfallId: this.waterfallId }, write }));
        }
      }

      // remove this right from its sources parent's children list (destinationId)
      for (const s of this.sources) {
        if (s.destinationId === id) {
          s.destinationId = '';
          promises.push(this.waterfallService.updateSource(this.waterfallId, s, { write }));
        }
      }

      // then delete this right
      promises.push(this.rightService.remove(id, { params: { waterfallId: this.waterfallId }, write }));
      await Promise.all(promises);
      await write.commit();

    } else {
      if (source.destinationId) {
        const rightChild = this.rights.find(right => right.id === source.destinationId);
        if (rightChild) {
          rightChild.nextIds = rightChild.nextIds.filter(id => id !== source.id);
          await this.rightService.update(rightChild.id, rightChild, { params: { waterfallId: this.waterfallId } });
        }
      }
      await this.waterfallService.removeSources(this.waterfallId, [id]);
    }

    this.select('');
  }

  private async updateSources(sources: WaterfallSource[], write?: WriteBatch) {
    if (!this.version || !this.version.standalone) {
      const standaloneSources = this.shell.waterfall.sources.filter(s => s.version && Object.values(s.version).some(v => v.standalone));
      return this.waterfallService.update(this.waterfallId, { id: this.waterfallId, sources: [...sources, ...standaloneSources] }, { write });
    } else {
      const waterfallSources = this.version?.id ? this.shell.waterfall.sources.filter(s => !s.version || !s.version[this.version.id]) : [];
      return this.waterfallService.update(this.waterfallId, { id: this.waterfallId, sources: [...sources, ...waterfallSources] }, { write });
    }
  }
}

@Pipe({ name: 'isHorizontal' })
export class IsHorizontalPipe implements PipeTransform {
  transform(type: RightType) {
    return type === 'horizontal';
  }
}

@Pipe({ name: 'isStep' })
export class IsStepPipe implements PipeTransform {
  transform(id: string, rights: Right[]) {
    const groupId = rights.find(r => r.id === id)?.groupId;
    return rights.find(r => r.id === groupId)?.type === 'vertical';
  }
}