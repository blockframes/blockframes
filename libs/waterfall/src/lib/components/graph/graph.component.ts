
import { ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';
import { BehaviorSubject, Observable, Subscription, combineLatest } from 'rxjs';
import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';

import { RightType, WaterfallRightholder } from '@blockframes/model';
import { FormStaticValueArray } from '@blockframes/utils/form';
import { boolean } from '@blockframes/utils/decorators/decorators';
import { GraphService } from '@blockframes/ui/graph/graph.service';
import { RightService } from '@blockframes/waterfall/right.service';
import { Right, Waterfall, WaterfallSource } from '@blockframes/model';
import { WaterfallService } from '@blockframes/waterfall/waterfall.service';
import { CardModalComponent } from '@blockframes/ui/card-modal/card-modal.component';

import { Arrow, Node, computeDiff, createChild, createSibling, fromGraph, toGraph, updateParents } from './layout';


@Component({
  selector: 'waterfall-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WaterfallGraphComponent implements OnInit, OnDestroy {

  @Input() @boolean editMode = true;
  showEdit = true;

  @Input() rights$: Observable<Right[]>;
  rights: Right[];
  @Input() waterfall$: Observable<Waterfall>;
  sources: WaterfallSource[];
  rightholders: WaterfallRightholder[];

  @ViewChild(CardModalComponent, { static: true }) cardModal: CardModalComponent;

  selected$ = new BehaviorSubject<string>('');
  isSourceSelected = false;

  nodes$ = new BehaviorSubject<Node[]>([]);
  arrows$ = new BehaviorSubject<Arrow[]>([]);

  sourceForm = new FormGroup({
    medias: new FormStaticValueArray<'territories'>([], 'territories'),
    territories: new FormStaticValueArray<'medias'>([], 'medias'),
    name: new FormControl(''),
  });

  rightForm = new FormGroup({
    type: new FormControl(''),
    org: new FormControl(''),
    name: new FormControl(''),
    percent: new FormControl(0),
    parents: new FormControl<string[]>([]),
  });

  rightholderNames$ = new BehaviorSubject<string[]>([]);

  subsctiptions: Subscription[] = [];

  constructor(
    private service: GraphService,
    private rightService: RightService,
    private route: ActivatedRoute,
    private waterfallService: WaterfallService,
  ) { }

  ngOnInit() {
    const sub = combineLatest([
      this.rights$,
      this.waterfall$,
    ]).subscribe(([ rights, waterfall ]) => {
      this.rights = rights;
      this.sources = waterfall.sources;
      this.rightholders = waterfall.rightholders;
      this.rightholderNames$.next(this.rightholders.map(r => r.name));
      this.layout();
    });

    this.subsctiptions.push(sub);
  }

  ngOnDestroy() {
    this.subsctiptions.forEach(sub => sub.unsubscribe());
  }

  select(id: string) {
    this.selected$.next(id);
    
    const source = this.sources.find(source => source.id === id);
    if (source) {
      this.isSourceSelected = true;
      this.sourceForm.controls.name.setValue(source.name);
      this.sourceForm.controls.medias.setValue(source.medias);
      this.sourceForm.controls.territories.setValue(source.territories);
      return;
    }

    const right = this.rights.find(right => right.id === id);
    if (right) {
      this.isSourceSelected = false;
      this.rightForm.controls.type.setValue(right.type);
      this.rightForm.controls.name.setValue(right.name);
      this.rightForm.controls.percent.setValue(right.percent);
      this.rightForm.controls.org.setValue(this.rightholders.find(r => r.id === right.rightholderId)?.name ?? '');

      const parents = this.nodes$.getValue().filter(node => node.children.includes(right.groupId || id)); // do not use ?? instead of ||, it will break since '' can be considered truthy
      this.rightForm.controls.parents.setValue(parents.map(parent => parent.id));
    }
  }

  unselect() {
    this.selected$.next('');
  }

  async updateRight() {
    const rightId = this.selected$.getValue();

    const graph = this.nodes$.getValue();
    updateParents(rightId, this.rightForm.controls.parents.value, graph);
    const newGraph = fromGraph(graph);
    const changes = computeDiff({ rights: this.rights, sources: this.sources }, newGraph);
    const right = changes.updated.rights.find(right => right.id === rightId);
    right.type = this.rightForm.controls.type.value as RightType;
    right.name = this.rightForm.controls.name.value;
    right.percent = this.rightForm.controls.percent.value;
    right.rightholderId = this.rightholders.find(r => r.name === this.rightForm.controls.org.value)?.id ?? '';

    const write = this.waterfallService.batch();
    await Promise.all([
      this.rightService.add(changes.created.rights, { params: { waterfallId: this.route.snapshot.params.movieId }, write }),
      this.rightService.update(changes.updated.rights, { params: { waterfallId: this.route.snapshot.params.movieId }, write }),
      this.rightService.remove(changes.deleted.rights.map(r => r.id), { params: { waterfallId: this.route.snapshot.params.movieId }, write }),
      this.waterfallService.update(this.route.snapshot.params.movieId, { id: this.route.snapshot.params.movieId, sources: newGraph.sources }, { write }),
    ]);
    await write.commit();
  }

  updateSource() {
    const sourceId = this.selected$.getValue();
    const source = this.sources.find(source => source.id === sourceId);
    if (!source) return;

    source.name = this.sourceForm.controls.name.value;
    source.medias = this.sourceForm.controls.medias.value as any;
    source.territories = this.sourceForm.controls.territories.value as any;

    this.waterfallService.updateSource(this.route.snapshot.params.movieId, source);
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
    const graph = this.nodes$.getValue();
    createSibling(id, graph);
    const newGraph = fromGraph(graph);
    const changes = computeDiff({ rights: this.rights, sources: this.sources }, newGraph);

    const write = this.waterfallService.batch();
    await Promise.all([
      this.rightService.add(changes.created.rights, { params: { waterfallId: this.route.snapshot.params.movieId }, write }),
      this.rightService.update(changes.updated.rights, { params: { waterfallId: this.route.snapshot.params.movieId }, write }),
      this.rightService.remove(changes.deleted.rights.map(r => r.id), { params: { waterfallId: this.route.snapshot.params.movieId }, write }),
      this.waterfallService.update(this.route.snapshot.params.movieId, { id: this.route.snapshot.params.movieId, sources: newGraph.sources }, { write }),
    ]);
    await write.commit();
  }

  async addChild(id: string) {

    const graph = this.nodes$.getValue();
    createChild(id, graph);
    const newGraph = fromGraph(graph);
    const changes = computeDiff({ rights: this.rights, sources: this.sources }, newGraph);

    const write = this.waterfallService.batch();
    await Promise.all([
      this.rightService.add(changes.created.rights, { params: { waterfallId: this.route.snapshot.params.movieId }, write }),
      this.rightService.update(changes.updated.rights, { params: { waterfallId: this.route.snapshot.params.movieId }, write }),
      this.rightService.remove(changes.deleted.rights.map(r => r.id), { params: { waterfallId: this.route.snapshot.params.movieId }, write }),
      this.waterfallService.update(this.route.snapshot.params.movieId, { id: this.route.snapshot.params.movieId, sources: newGraph.sources }, { write }),
    ]);
    await write.commit();
  }

  createNewSource() {
    const newSource: WaterfallSource = {
      id: `zsource-${this.sources.length + 1}-${Math.random().toString(36).substr(2, 9)}`, // TODO USE REAL IDS
      name: `Source ${this.sources.length + 1}`,
      medias: [],
      territories: [],
      destinationId: '',
    };
    this.waterfallService.addSource(this.route.snapshot.params.movieId, newSource);
    this.select(newSource.id);
  }

  createNewRight() {
    const newRight: Right = {
      id: `zright-${this.rights.length + 1}-${Math.random().toString(36).substr(2, 9)}`, // TODO USE REAL IDS
      name: `Right ${this.rights.length + 1}`,
      type: 'unknown',
      percent: 0,
      rightholderId: '',
      groupId: '',
      actionName: 'prepend',
      nextIds: [],
      pools: [],
      order: 0,
    };
    this.rightService.add(newRight, { params: { waterfallId: this.route.snapshot.params.movieId } });
    this.select(newRight.id);
  }

  async delete() {
    const id = this.selected$.getValue();
    const right = this.rights.find(right => right.id === id);
    const source = this.sources.find(source => source.id === id);

    if (!right && !source) return;

    if (right) {
      if (right.groupId) {
        const group = this.rights.find(r => r.id === right.groupId);
        if (group.type === 'vertical') return; // TODO

        const members = this.rights.filter(r => r.groupId === group.id && r.id !== right.id);

        // if the group only has one member left, delete the group
        if (members.length === 1) {

          const write = this.waterfallService.batch();

          // remove this group from its sources parent's children list (destinationId)
          const parentSource = this.sources.find(s => s.destinationId === group.id);
          if (parentSource) {
            parentSource.destinationId = members[0].id;
            
            await this.waterfallService.updateSource(this.route.snapshot.params.movieId, parentSource, { write });
          };

          members[0].groupId = '';
          members[0].nextIds = [ ...group.nextIds ];

          const ids = [ members[0].id ];
          const rightsToUpdate = [ members[0] ];

          // remove this group from its children's parent list (nextIds)
          this.rights.map(r => {
            if (r.nextIds.includes(group.id)) {
              const nextIds = r.nextIds.filter(nextId => nextId !== group.id);
              nextIds.push(members[0].id);
              ids.push(r.id);
              rightsToUpdate.push({ ...r, nextIds });
            }
          });

          await Promise.all([
            this.rightService.update(rightsToUpdate, { params: { waterfallId: this.route.snapshot.params.movieId }, write }),
            this.rightService.remove([ id, group.id ], { params: { waterfallId: this.route.snapshot.params.movieId }, write }),
          ]);
          await write.commit();
          return;
        }
      }

      // remove this right from its children's parent list (nextIds)
      this.rights.map(r => {
        if (r.nextIds.includes(id)) {
          const nextIds = r.nextIds.filter(nextId => nextId !== id);
          this.rightService.update(r.id, { ...r, nextIds }, { params: { waterfallId: this.route.snapshot.params.movieId } });
        }
      });

      // remove this right from its sources parent's children list (destinationId)
      this.sources.map(s => {
        if (s.destinationId === id) {
          s.destinationId = '';
          this.waterfallService.updateSource(this.route.snapshot.params.movieId, s);
        }
      });

      // then delete this right
      this.rightService.remove(id, { params: { waterfallId: this.route.snapshot.params.movieId } });

    } else {
      if (source.destinationId) {
        const rightChild = this.rights.find(right => right.id === source.destinationId);
        if (rightChild) {
          rightChild.nextIds = rightChild.nextIds.filter(id => id !== source.id);
          this.rightService.update(rightChild.id, rightChild, { params: { waterfallId: this.route.snapshot.params.movieId } });
        }
      }
      this.waterfallService.removeSources(this.route.snapshot.params.movieId, [id]);
    }

    this.select('');
  }
}
