import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Optional,
  Output,
  Pipe,
  PipeTransform,
  ViewChild
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Intercom } from '@supy-io/ngx-intercom';
import { WriteBatch } from 'firebase/firestore';
import { BehaviorSubject, Observable, Subscription, combineLatest, map, tap } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabGroup } from '@angular/material/tabs';
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
  WaterfallContract,
  getDefaultVersionId,
  WaterfallRightholder,
  createWaterfallSource,
  Media,
  Territory,
  toGroupLabel,
  smartJoin,
  trimString,
  getNonEditableNodeIds,
  preferredLanguage,
} from '@blockframes/model';
import { boolean } from '@blockframes/utils/decorators/decorators';
import { GraphService } from '@blockframes/ui/graph/graph.service';
import { CardModalComponent, cardModalI18nStrings } from '@blockframes/ui/card-modal/card-modal.component';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';
import { ConfirmComponent } from '@blockframes/ui/confirm/confirm.component';
import { RightService } from '../../right.service';
import { WaterfallService } from '../../waterfall.service';
import { createRightForm, setRightFormValue } from '../../form/right.form';
import { createSourceForm, setSourceFormValue } from '../../form/source.form';
import { RevenueSimulationForm } from '../../form/revenue-simulation.form';
import { DashboardWaterfallShellComponent } from '../../dashboard/shell/shell.component';
import {
  Arrow,
  HorizontalNode,
  Node,
  VerticalNode,
  computeDiff,
  createChild,
  createSibling,
  createStep,
  deleteStep,
  fromGraph,
  toGraph,
  updateParents
} from './layout';

@Component({
  selector: 'waterfall-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WaterfallGraphComponent implements OnInit, OnDestroy {

  @Input() @boolean public readonly = false;
  @Input() set stateMode(mode: 'simulation' | 'actual') { this.stateMode$.next(mode); }
  public stateMode$ = new BehaviorSubject<'simulation' | 'actual'>('actual');
  public rightPanelMode$ = this.stateMode$.asObservable().pipe(
    map(stateMode => {
      if (stateMode === 'simulation') {
        this.showEditPanel = true;
        this.rightForm.markAsPristine();
        this.sourceForm.markAsPristine();
        this.conditionFormPristine$.next(true);
        this.handleSelect('');
        return 'simulation';
      } else {
        this.showSimulationResults$.next(false);
      }
      return this.readonly ? 'readonly' : 'builder';
    }));
  public showSimulationResults$ = new BehaviorSubject<boolean>(false);
  @Input() simulationForm: RevenueSimulationForm;
  @Input() set triggerNewSource(val: string) {
    if (val !== undefined) {
      this.createNewSource();
      this.simulationExited.emit(true);
    }
  }
  @Input() set triggerNewRight(val: string) {
    if (val !== undefined) {
      this.createNewRight();
      this.simulationExited.emit(true);
    }
  }
  @Input() set triggerUnselect(val: string) {
    if (val !== undefined) {
      this.select('');
      this.simulationExited.emit(true);
    }
  }
  @Output() simulationExited = new EventEmitter<boolean>(false);
  @Output() canLeaveGraphForm = new EventEmitter<boolean>(true);
  public showEditPanel = this.shell.canBypassRules;
  public waterfall = this.shell.waterfall;
  public isDefaultVersion: boolean;
  public isDuplicateVersion = false;
  public selected$ = new BehaviorSubject<string>('');
  public isSourceSelected = false;
  public nodes$ = new BehaviorSubject<Node[]>([]);
  public nonEditableNodeIds$ = new BehaviorSubject<string[]>([]);
  public nonPartiallyEditableNodeIds$ = new BehaviorSubject<string[]>([]);
  public availableNodes$: Observable<(Node & { disabled: boolean })[]> = combineLatest([this.nodes$, this.selected$, this.nonEditableNodeIds$]).pipe(
    map(([nodes, selected, nonEditableNodeIds]) => {
      const isGroupOfSelected = (node: HorizontalNode) => node.members.find(m => m.id === selected || (m.type === 'vertical' && m.members.find(v => v.id === selected)));
      const isSelectedHorizontalGroup = (node: Node) => node.type === 'horizontal' && isGroupOfSelected(node);

      const selectedNode = nodes.find(node => node.id === selected); // Directly clicked node
      const currenthGroup = nodes.find(isSelectedHorizontalGroup); // Horizontal Group of the clicked node
      const current = selectedNode || currenthGroup;
      return nodes.filter(node =>
        node.id !== selected && // removes current node
        !(isSelectedHorizontalGroup(node)) &&  // removes current node group
        !(current && current.children.includes(node.id)) // removes direct children of the current node
      ).map(node => {
        const disabled = nonEditableNodeIds.includes(node.id);
        return { ...node, disabled };
      });
    })
  );
  public arrows$ = new BehaviorSubject<Arrow[]>([]);
  public rightForm = createRightForm();
  public rightFormValid$ = new BehaviorSubject<boolean>(true);
  public invalidFormTooltip = $localize`Please fill all required fields`;
  public sourceForm = createSourceForm();
  public rightholderControl = new FormControl<string>('');
  public rightholderNames$ = new BehaviorSubject<string[]>([]);
  public relevantContracts$ = new BehaviorSubject<WaterfallContract[]>([]);
  public rights: Right[];
  public conditionFormPristine$ = new BehaviorSubject<boolean>(true);
  public i18nStrings = {
    ...cardModalI18nStrings,
    groupName: $localize`Group Name`,
    receiptShareName: $localize`Receipt Share Name`,
    groupDetais: $localize`Group Details`,
    receiptsShare: $localize`Receipts Shares`,
  };

  private waterfallId = this.shell.waterfall.id;
  private sources: WaterfallSource[];
  private defaultVersionId: string;
  private producer = this.shell.waterfall.rightholders.find(r => r.roles.includes('producer'));
  private version: Version;
  private subscriptions: Subscription[] = [];
  private rightholders: WaterfallRightholder[];
  private contracts: WaterfallContract[];

  @ViewChild(CardModalComponent, { static: true }) cardModal: CardModalComponent;
  @ViewChild('formTabs', { static: false }) formTabs: MatTabGroup;

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
    const lang = preferredLanguage();
    if (this.readonly) this.showEditPanel = false;
    if (!this.producer) {
      this.snackBar.open(`${toLabel('producer', 'rightholderRoles', undefined, undefined, lang)} is not defined.`, this.shell.canBypassRules ? 'WATERFALL MANAGEMENT' : 'ASK FOR HELP', { duration: 5000 })
        .onAction()
        .subscribe(() => {
          if (this.shell.canBypassRules) {
            this.router.navigate(['c/o/dashboard/title', this.waterfallId, 'init']);
          } else {
            this.intercom.show($localize`${toLabel('producer', 'rightholderRoles', undefined, undefined, lang)} is not defined in the waterfall "${this.shell.movie.title.international}"`);
          }
        });
    }

    this.subscriptions.push(combineLatest([
      this.shell.rightholderRights$,
      this.shell.rightholderSources$,
      this.shell.waterfall$,
      this.shell.versionId$.pipe(tap(_ => this.select(''))),
      this.shell.statements$.pipe(map(statements => statements.filter(s => s.status === 'reported'))),
      this.shell.contracts$,
      this.shell.hiddenRightHolderIds$,
      this.shell.incomes$,
    ]).subscribe(([rights, sources, waterfall, versionId, reportedStatements, contracts, hiddenRightHolderIds, incomes]) => {
      this.rights = rights;
      this.contracts = contracts;
      this.version = waterfall.versions.find(v => v.id === versionId);
      this.sources = sources;
      this.rightholders = waterfall.rightholders;
      // Only producer or rightholders with contracts with the producer can be selected
      const relevantRightholders = this.rightholders.filter(r => r.id === this.producer?.id || getContractsWith([r.id, this.producer?.id], this.contracts).length > 0);
      this.rightholderNames$.next(relevantRightholders.map(r => r.name));
      this.isDefaultVersion = isDefaultVersion(waterfall, versionId);
      this.defaultVersionId = getDefaultVersionId(waterfall);
      const allNodeIds = [...rights.map(r => r.id), ...this.sources.map(s => s.id)];

      this.sourceForm.enable();
      this.rightForm.enable();

      if (this.readonly) {
        this.nonEditableNodeIds$.next(allNodeIds); // All nodes are non-editable
        this.nonPartiallyEditableNodeIds$.next(this.nonEditableNodeIds$.value); // All nodes are non-editable
      } else {
        this.nonEditableNodeIds$.next([]);
        this.nonPartiallyEditableNodeIds$.next(this.nonEditableNodeIds$.value);

        this.isDuplicateVersion = this.version?.id && !this.isDefaultVersion && !this.version.standalone;

        if (this.isDuplicateVersion) {
          this.nonEditableNodeIds$.next(allNodeIds); // All nodes are non-editable
          // Nodes not "touched" by a reported statement are still partially editable (percentage and conditions)
          this.nonPartiallyEditableNodeIds$.next(getNonEditableNodeIds(rights, this.sources, reportedStatements, incomes));
          // Re-partially disable current selected form
          this.setFormState(this.selected$.value);
        } else {
          // Nodes not "touched" by a reported statement are still fully editable
          this.nonEditableNodeIds$.next(getNonEditableNodeIds(rights, this.sources, reportedStatements, incomes));
          this.nonPartiallyEditableNodeIds$.next(this.nonEditableNodeIds$.value);
        }
      }

      this.layout(hiddenRightHolderIds);
    }));

    this.subscriptions.push(this.rightForm.controls.org.valueChanges.subscribe(org => {
      this.updateRightName(org, undefined);
      const rightholder = this.rightholders.find(r => r.name === org);
      this.rightholderControl.setValue(rightholder?.name);
      if (rightholder && rightholder.id !== this.producer?.id) {
        this.relevantContracts$.next(getContractsWith([rightholder.id, this.producer?.id], this.contracts));
      } else {
        this.relevantContracts$.next([]);
      }

      // Clean contract input if no relevant contract or populate with first one.
      if (rightholder && rightholder.id !== this.producer?.id) {
        const contracts = this.relevantContracts$.value;
        this.rightForm.controls.contract.setValue(contracts.length === 0 ? '' : contracts[0].id);
      }
    }));

    this.subscriptions.push(this.rightForm.controls.type.valueChanges.subscribe(type => this.updateRightName(undefined, type)));

    this.subscriptions.push(this.rightholderControl.valueChanges.subscribe(name => {
      const rightholder = this.rightholders.find(r => r.name === name);
      if (rightholder) {
        if (this.rightForm.controls.org.value !== rightholder.name) {
          this.rightForm.markAsDirty();
          this.rightForm.controls.org.setValue(rightholder.name);
        }
      } else {
        this.rightholderControl.setErrors({ invalidValue: true });
        if (name !== '' && this.rightForm.controls.org.value) this.rightForm.markAsDirty();
      }
    }));

    this.subscriptions.push(this.sourceForm.controls.medias.valueChanges.subscribe(medias => this.updateSourceName(medias, undefined)));
    this.subscriptions.push(this.sourceForm.controls.territories.valueChanges.subscribe(territories => this.updateSourceName(undefined, territories)));

    this.subscriptions.push(combineLatest([this.rightForm.valueChanges, this.sourceForm.valueChanges, this.conditionFormPristine$]).subscribe(() => {
      this.rightFormValid$.next(this.rightFormValid());
      const canLeaveGraphForm = this.rightForm.pristine && this.sourceForm.pristine && this.conditionFormPristine$.value;
      this.canLeaveGraphForm.emit(canLeaveGraphForm);
    }));
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  private rightFormValid() {
    const rightholderName = this.rightForm.controls.org.value;
    const rightholder = this.rightholders.find(r => r.name === rightholderName);
    if (!rightholder) return false;

    const invalidContract = this.producer?.id !== rightholder.id &&
      this.rightForm.controls.type.value !== 'horizontal' &&
      !this.rightForm.controls.contract.value;
    if (invalidContract) return false;

    return true;
  }

  private setFormState(selected: string) {
    if (this.nonEditableNodeIds$.value.includes(selected)) {
      this.rightForm.disable();
      this.rightForm.get('parents').enable();
      this.rightholderControl.disable();
      if (!this.nonPartiallyEditableNodeIds$.value.includes(selected)) {
        this.rightForm.controls.percent.enable();
        this.rightForm.controls.steps.enable();
      }
    } else {
      this.rightForm.enable();
      this.rightholderControl.enable();
    }
  }

  private updateRightName(org?: string, type?: RightType) {
    if (this.rightForm.pristine) return;
    const right = this.rightForm.value;
    const o = org ?? right.org;
    const t = rightTypes[type ?? right.type];
    if (!t || !o) return;
    if (`${o} - ${t}` === right.name) return;
    if (!right.name || right.name === $localize`New right` || right.name.includes(' - ')) {
      this.rightForm.controls.name.setValue(`${o} - ${t}`);
    }
  }

  private updateSourceName(_medias: Media[], _territories: Territory[]) {
    if (this.sourceForm.pristine) return;
    const maxLength = 20;
    const source = this.sourceForm.value;
    const groupedMedias = toGroupLabel(_medias || source.medias, 'medias', 'All Medias');
    const medias = trimString(smartJoin(groupedMedias, ', ', ' and '), maxLength, true);
    const groupedTerritories = toGroupLabel(_territories || source.territories, 'territories', 'World');
    const territories = trimString(smartJoin(groupedTerritories, ', ', ' and '), maxLength, true);
    if (!medias || !territories) return;
    if (`${medias} - ${territories}` === source.name) return;
    if (!source.name || source.name === $localize`New source` || source.name.includes(' - ')) {
      this.sourceForm.controls.name.setValue(`${medias} - ${territories}`);
    }
  }

  openIntercom() {
    return this.intercom.show($localize`I need help to create a waterfall`);
  }

  select(id: string) {
    if (id == this.selected$.value) return;

    if (this.stateMode$.value === 'simulation') {
      if (!this.simulationForm.pristine) {
        const dialogRef = this.dialog.open(ConfirmComponent, {
          data: createModalData({
            title: $localize`You are about to leave the simulation mode, are you sure?`,
            question: $localize`Pay attention, if you exist the simulation mode you are going to loose the simulation data.`,
            cancel: $localize`Cancel`,
            confirm: $localize`Leave anyway`
          }, 'small'),
          autoFocus: false
        });
        const sub = dialogRef.afterClosed().subscribe((leave: boolean) => {
          if (leave) {
            this.simulationExited.next(true);
            return this.handleSelect(id);
          } else {
            return;
          }
        });

        this.subscriptions.push(sub);
      } else {
        this.simulationExited.next(true);
        return this.handleSelect(id);
      }

    } else {
      return this.handleSelect(id);
    }
  }

  private handleSelect(id: string) {
    if (this.cardModal.isOpened) this.cardModal.toggle();
    if (this.readonly) {
      if (id) {
        const right = this.rights.find(right => right.id === id);
        this.showEditPanel = !!right && right.type !== 'horizontal';
      } else {
        this.showEditPanel = false;
      }
      return this._select(id);
    }
    const allPristine = this.rightForm.pristine && this.sourceForm.pristine && this.conditionFormPristine$.value;
    if (allPristine) return this._select(id);

    let subject = $localize`Receipt Share`;
    if (!this.sourceForm.pristine) subject = $localize`Source`;
    if (!this.conditionFormPristine$.value) subject = $localize`Receipt Share Conditions`;
    const dialogRef = this.dialog.open(ConfirmComponent, {
      data: createModalData({
        title: $localize`You are about to leave the ${subject} form`,
        question: $localize`Some changes have not been saved. If you leave now, you might lose these changes`,
        cancel: $localize`Cancel`,
        confirm: $localize`Leave anyway`
      }, 'small'),
      autoFocus: false
    });
    const sub = dialogRef.afterClosed().subscribe((leave: boolean) => {
      if (leave) {
        this.rightForm.markAsPristine();
        this.sourceForm.markAsPristine();
        this.conditionFormPristine$.next(true);
        return this._select(id);
      } else {
        return;
      }
    });

    this.subscriptions.push(sub);

  }

  private async _select(id: string) {
    this.selected$.next(id);
    if (!id) return;

    const source = this.sources.find(source => source.id === id);
    if (source) {
      if (this.nonEditableNodeIds$.value.includes(id)) {
        this.sourceForm.disable();
      } else {
        this.sourceForm.enable();
      }
      this.isSourceSelected = true;
      setSourceFormValue(this.sourceForm, source);
      return;
    }

    const right = this.rights.find(right => right.id === id);
    if (right) {
      this.setFormState(id);
      this.isSourceSelected = false;
      let steps: Condition[][] = [];

      if (right.rightholderId && right.rightholderId !== this.producer?.id) {
        this.relevantContracts$.next(getContractsWith([right.rightholderId, this.producer?.id], this.contracts));
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
        // Populate rightForm with first step data.
        const parent = right.groupId ? this.rights.find(r => r.id === right.groupId) : undefined;
        if (parent && parent.type === 'vertical') {
          const members = this.rights.filter(r => r.groupId === parent.id).sort((a, b) => a.order - b.order);
          if (members.length) {
            const firstChild = members[0];
            right.contractId = firstChild.contractId;
            right.type = firstChild.type;
            right.rightholderId = firstChild.rightholderId;
          }
        }
        steps[0] = right.conditions?.conditions.filter(c => !isConditionGroup(c)) as Condition[] ?? [];
        rightholderId = right.rightholderId;
      }

      const rightholderName = this.rightholders.find(r => r.id === rightholderId)?.name ?? '';
      const parents = this.nodes$.getValue().filter(node => node.children.includes(right.groupId || id)); // do not use ?? instead of ||, it will break since '' can be considered truthy
      setRightFormValue(this.rightForm, { ...right, type, rightholderId: rightholderName, nextIds: parents.map(parent => parent.id) }, steps);
      if (this.formTabs && !this.rightFormValid()) this.formTabs.selectedIndex = 0;
    }
  }

  async updateRight() {
    const rightholderName = this.rightForm.controls.org.value;
    const rightholder = this.rightholders.find(r => r.name === rightholderName);
    if (!rightholder) {
      this.snackBar.open($localize`Please provide a valid Right Holder name`, 'close', { duration: 3000 });
      return;
    }

    if (this.relevantContracts$.value.length === 0) this.rightForm.controls.contract.setValue('');

    if (this.producer?.id !== rightholder.id && this.rightForm.controls.type.value !== 'horizontal' && !this.rightForm.controls.contract.value) {
      this.snackBar.open($localize`Please provide the contract associated to this Receipt Share`, 'close', { duration: 3000 });
      return;
    }

    const rightId = this.selected$.getValue();
    const graph = this.nodes$.getValue();

    try {
      updateParents(rightId, this.rightForm.controls.parents.value, graph, this.producer?.id);
    } catch (error) {
      this.snackBar.open(error, 'close', { duration: 3000 });
      return;
    }
    const newGraph = fromGraph(graph, this.version);
    const changes = computeDiff({ rights: this.rights, sources: this.sources }, newGraph);
    const right = changes.updated.rights.find(right => right.id === rightId);
    const existingRight = this.rights.find(r => r.id === rightId);
    right.type = existingRight.type === 'vertical' ? 'vertical' : this.rightForm.controls.type.value;
    right.name = this.rightForm.controls.name.value;
    right.percent = this.rightForm.controls.percent.value;
    right.contractId = this.rightForm.controls.contract.value;
    right.pools = existingRight.pools;

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

    this.rightForm.markAsPristine();
    this.conditionFormPristine$.next(true);

    const write = this.waterfallService.batch();
    await Promise.all([
      this.rightService.add(changes.created.rights, { params: { waterfallId: this.waterfallId }, write }),
      this.rightService.update(changes.updated.rights, { params: { waterfallId: this.waterfallId }, write }),
      this.rightService.remove(changes.deleted.rights.map(r => r.id), { params: { waterfallId: this.waterfallId }, write }),
      this.updateSources(newGraph.sources, write),
    ]);
    await write.commit();

    if (right.type === 'horizontal') {
      this.snackBar.open($localize`Group Details saved`, 'close', { duration: 3000 });
    } else {
      this.snackBar.open($localize`Receipt Share saved`, 'close', { duration: 3000 });
    }
  }

  async updateSource() {
    const sourceId = this.selected$.getValue();
    if (this.nonEditableNodeIds$.value.includes(sourceId)) {
      this.snackBar.open($localize`Operation not permitted.`, 'close', { duration: 5000 });
      return;
    }
    const source = this.sources.find(source => source.id === sourceId);
    if (!source) return;

    source.name = this.sourceForm.controls.name.value;
    source.medias = this.sourceForm.controls.medias.value;
    source.territories = this.sourceForm.controls.territories.value;

    this.sourceForm.markAsPristine();

    await this.waterfallService.updateSource(this.waterfallId, source);
    this.snackBar.open($localize`Receipt Source saved`, 'close', { duration: 3000 });
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
    if (this.nonEditableNodeIds$.value.includes(id)) {
      this.snackBar.open($localize`Operation not permitted.`, 'close', { duration: 5000 });
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
    if (this.nonEditableNodeIds$.value.includes(id)) {
      this.snackBar.open($localize`Operation not permitted.`, 'close', { duration: 5000 });
      return;
    }
    const graph = this.nodes$.getValue();

    try {
      createChild(id, graph, this.producer?.id);
    } catch (error) {
      this.snackBar.open(error, 'close', { duration: 3000 });
      return;
    }

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
    const graph = this.nodes$.getValue();
    const rightId = this.selected$.getValue();
    if (this.nonEditableNodeIds$.value.includes(rightId)) {
      this.snackBar.open($localize`Operation not permitted.`, 'close', { duration: 5000 });
      return;
    }
    const currentStepName = createStep(rightId, graph, this.rightForm.controls.name.value);
    const newGraph = fromGraph(graph, this.version);
    const changes = computeDiff({ rights: this.rights, sources: this.sources }, newGraph);
    if (currentStepName) this.rightForm.controls.name.setValue(currentStepName);

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
    const graph = this.nodes$.getValue();
    const rightId = this.selected$.getValue();
    if (this.nonEditableNodeIds$.value.includes(rightId)) {
      this.snackBar.open($localize`Operation not permitted.`, 'close', { duration: 5000 });
      return;
    }
    const wasLastMember = deleteStep(rightId, index, graph);
    const newGraph = fromGraph(graph, this.version);
    const changes = computeDiff({ rights: this.rights, sources: this.sources }, newGraph);

    const write = this.waterfallService.batch();
    try {
      await Promise.all([
        this.rightService.add(changes.created.rights, { params: { waterfallId: this.waterfallId }, write }),
        this.rightService.update(changes.updated.rights, { params: { waterfallId: this.waterfallId }, write }),
        this.rightService.remove(changes.deleted.rights.map(r => r.id), { params: { waterfallId: this.waterfallId }, write }),
        this.updateSources(newGraph.sources, write),
      ]);
      await write.commit();
    } catch (_) {
      this.snackBar.open($localize`An error occured, please try again.`, 'close', { duration: 5000 });
    }

    if (wasLastMember) {
      // Last member was deteled we unselect current right to prevent errors
      this.rightForm.markAsPristine();
      this.select('');
    }
  }

  async createNewSource() {
    if (this.isDuplicateVersion) {
      this.snackBar.open($localize`Operation not permitted on this version. Switch to default.`, 'close', { duration: 5000 });
      return;
    }
    const newSource = createWaterfallSource({
      id: this.waterfallService.createId(),
      name: $localize`New source`,
    });

    if (this.version?.standalone) {
      newSource.version[this.version.id] = { standalone: true };
    }

    await this.waterfallService.addSource(this.shell.waterfall, newSource);
    this.select(newSource.id);
  }

  async createNewRight() {
    if (this.isDuplicateVersion) {
      this.snackBar.open($localize`Operation not permitted on this version. Switch to default.`, 'close', { duration: 5000 });
      return;
    }
    const newRight = createRight({
      name: $localize`New right`,
      percent: 0,
    });

    if (this.version?.standalone) {
      newRight.version[this.version.id] = { standalone: true };
    }

    const id = await this.rightService.add(newRight, { params: { waterfallId: this.waterfallId } });
    this.select(id);
  }

  async delete(rightId?: string) {
    if (this.nonEditableNodeIds$.value.includes(rightId)) {
      this.snackBar.open($localize`Operation not permitted.`, 'close', { duration: 5000 });
      return;
    }

    if (this.cardModal.isOpened) this.cardModal.toggle();
    const id = rightId ?? this.selected$.getValue();
    const right = this.rights.find(right => right.id === id);

    const subject = right ? $localize`Receipt Share` : $localize`Source`;

    this.dialog.open(ConfirmComponent, {
      data: createModalData({
        title: $localize`Are you sure to delete this ${subject}?`,
        question: $localize`Pay attention, if you delete the following ${subject}, it will have an impact on conditions and the whole Waterfall.`,
        confirm: $localize`Yes, delete ${subject}`,
        cancel: $localize`No, come back to Waterfall Builder`,
        onConfirm: () => this.handleDeletion(id),
      })
    });
  }

  private async handleDeletion(rightId?: string) {
    const id = rightId ?? this.selected$.getValue();
    const right = this.rights.find(right => right.id === id);
    const source = this.sources.find(source => source.id === id);

    if (!right && !source) return;

    this.rightForm.markAsPristine();
    this.sourceForm.markAsPristine();
    this.conditionFormPristine$.next(true);

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
          }

          members[0].groupId = group.groupId ?? '';
          members[0].nextIds = [...group.nextIds];
          const rightsToUpdate = [members[0]];

          // remove this group from its children's parent list (nextIds)
          for (const r of this.rights) {
            if (r.nextIds.includes(group.id)) {
              const nextIds = r.nextIds.filter(nextId => nextId !== group.id);
              nextIds.push(members[0].id);
              rightsToUpdate.push({ ...r, nextIds });
            }
          }

          await Promise.all([
            this.rightService.update(rightsToUpdate, { params: { waterfallId: this.waterfallId }, write }),
            this.rightService.remove([id, group.id], { params: { waterfallId: this.waterfallId }, write }),
          ]);
          await write.commit();
          this.select('');
          return;
        }

        // delete the right and update the order (and name) of the remaining members
        if (group.type === 'vertical') {
          const vMembers = this.rights.filter(r => r.groupId === group.id).sort((a, b) => a.order - b.order);
          const indexToRemove = vMembers.findIndex(r => r.id === id);
          vMembers.splice(indexToRemove, 1);
          vMembers.forEach((r, index) => {
            r.order = index;
            r.name = $localize`Step ${index + 1}`;
          });

          const write = this.waterfallService.batch();
          const promises: Promise<unknown>[] = [];
          vMembers.forEach(r => promises.push(this.rightService.update(r.id, r, { params: { waterfallId: this.waterfallId }, write })));
          promises.push(this.rightService.remove(id, { params: { waterfallId: this.waterfallId }, write }));
          await Promise.all(promises);
          await write.commit();
          this.select('');
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

  public addCondition(data: { rightId: string, condition: Condition, step: number, index: number }) {
    if (this.selected$.value != data.rightId) return;
    const steps = this.rightForm.controls.steps.value;
    steps[data.step][data.index] = data.condition;
    this.rightForm.controls.steps.setValue(steps);
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

  public populateSimulation() {
    const incomes = this.simulationForm.get('incomes').value.filter(i => i.price > 0);
    const expenses = this.simulationForm.get('expenses').value.filter(e => e.price > 0);
    const fromScratch = this.simulationForm.get('fromScratch').value;
    this.showSimulationResults$.next(!this.showSimulationResults$.value);
    const resetData = !fromScratch;
    return this.shell.appendToSimulation({ incomes, expenses }, { fromScratch, resetData });
  }

  public exitSimulation(showModale = false) {
    if (!this.simulationForm.pristine && showModale) {
      const dialogRef = this.dialog.open(ConfirmComponent, {
        data: createModalData({
          title: $localize`You are about to leave the simulation mode, are you sure?`,
          question: $localize`Pay attention, if you exist the simulation mode you are going to loose the simulation data.`,
          cancel: $localize`Cancel`,
          confirm: $localize`Leave anyway`
        }, 'small'),
        autoFocus: false
      });
      const sub = dialogRef.afterClosed().subscribe((leave: boolean) => {
        if (leave) {
          this.simulationExited.next(true);
          if (this.cardModal.isOpened) this.cardModal.toggle();
        }
      });

      this.subscriptions.push(sub);
    } else {
      this.simulationExited.next(true);
      if (this.cardModal.isOpened) this.cardModal.toggle();
    }
  }
}

@Pipe({ name: 'getNode' })
export class GetNodePipe implements PipeTransform {
  transform(id: string, nodes: Node[]) {
    let node = nodes.find(r => r.id === id);
    if (node) return node;
    for (const n of nodes) {
      if (n.type === 'horizontal') {
        node = n.members.find(r => r.id === id);
        if (node) return node;
        for (const nn of n.members) {
          if (nn.type === 'vertical') {
            node = nn.members.find(r => r.id === id);
            if (node) return node;
          }
        }
      } else if (n.type === 'vertical') {
        node = n.members.find(r => r.id === id);
        if (node) return node;
      }
    }
  }
}

@Pipe({ name: 'getGroup' })
export class GetGroupPipe implements PipeTransform {
  transform(childId: string, nodes: Node[]) {
    const isGroupOfSelected = (node: HorizontalNode) => node.members.some(m => m.id === childId || (m.type === 'vertical' && m.members.some(v => v.id === childId)));
    const isSelectedHorizontalGroup = (node: Node) => node.type === 'horizontal' && isGroupOfSelected(node);
    const isSelectedVerticalGroup = (node: Node) => node.type === 'vertical' && node.members.some(m => m.id === childId);

    return nodes.find(node => isSelectedHorizontalGroup(node) || isSelectedVerticalGroup(node)) as HorizontalNode | VerticalNode;
  }
}