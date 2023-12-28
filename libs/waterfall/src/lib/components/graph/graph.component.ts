
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Observable, Subscription, combineLatest } from 'rxjs';
import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';

import { boolean } from '@blockframes/utils/decorators/decorators';
import { GraphService } from '@blockframes/ui/graph/graph.service';
import { CardModalComponent } from '@blockframes/ui/card-modal/card-modal.component';
import { Media, Right, RightType, Territory, Waterfall, WaterfallRightholder, WaterfallSource, createRight, createWaterfallSource } from '@blockframes/model';

import { RightService } from '../../right.service';
import { WaterfallService } from '../../waterfall.service';
import { createRightForm, setRightFormValue } from '../forms/right-form/right-form';
import { createSourceForm, setSourceFormValue } from '../forms/source-form/source-form';
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

  rightForm = createRightForm();
  sourceForm = createSourceForm();

  rightholderNames$ = new BehaviorSubject<string[]>([]);

  subscription: Subscription;

  constructor(
    private service: GraphService,
    private rightService: RightService,
    private route: ActivatedRoute,
    private waterfallService: WaterfallService,
  ) { }

  ngOnInit() {
    this.subscription = combineLatest([
      this.rights$,
      this.waterfall$,
    ]).subscribe(([ rights, waterfall ]) => {
      this.rights = rights;
      this.sources = waterfall.sources;
      this.rightholders = waterfall.rightholders;
      this.rightholderNames$.next(this.rightholders.map(r => r.name));
      this.layout();
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  select(id: string) {
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
      const org = this.rightholders.find(r => r.id === right.rightholderId)?.name ?? '';;
      const parents = this.nodes$.getValue().filter(node => node.children.includes(right.groupId || id)); // do not use ?? instead of ||, it will break since '' can be considered truthy
      setRightFormValue(this.rightForm, { ...right, rightholderId: org, nextIds: parents.map(parent => parent.id) });
    }
  }

  unselect() {
    this.selected$.next('');
  }

  async updateRight() {
    const rightId = this.selected$.getValue();
    console.log(rightId);

    const graph = this.nodes$.getValue();
    updateParents(rightId, this.rightForm.controls.parents.value, graph);
    console.log(graph);
    const newGraph = fromGraph(graph);
    console.log(newGraph);
    const changes = computeDiff({ rights: this.rights, sources: this.sources }, newGraph);
    const right = changes.updated.rights.find(right => right.id === rightId);
    right.type = this.rightForm.controls.type.value as RightType;
    right.name = this.rightForm.controls.name.value;
    right.percent = this.rightForm.controls.percent.value;
    right.rightholderId = this.rightholders.find(r => r.name === this.rightForm.controls.org.value)?.id ?? '';
    right.conditions = { operator: 'AND', conditions: this.rightForm.controls.conditions.value };

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
    source.medias = this.sourceForm.controls.medias.value as Media[];
    source.territories = this.sourceForm.controls.territories.value as Territory[];

    return this.waterfallService.updateSource(this.route.snapshot.params.movieId, source);
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
    return write.commit();
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
    return write.commit();
  }

  async createNewSource() {
    const newSource = createWaterfallSource({
      id: this.waterfallService.createId(),
      name: `Source ${this.sources.length + 1}`,
    });
    await this.waterfallService.addSource(this.route.snapshot.params.movieId, newSource);
    this.select(newSource.id);
  }

  async createNewRight() {
    const newRight = createRight({
      name: `Right ${this.rights.length + 1}`,
      percent: 0,
    });
    const id = await this.rightService.add(newRight, { params: { waterfallId: this.route.snapshot.params.movieId } });
    this.select(id);
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

      const write = this.waterfallService.batch();
      const promises: Promise<unknown>[] = []; 

      // remove this right from its children's parent list (nextIds)
      this.rights.map(r => {
        if (r.nextIds.includes(id)) {
          const nextIds = r.nextIds.filter(nextId => nextId !== id);
          promises.push(this.rightService.update(r.id, { ...r, nextIds }, { params: { waterfallId: this.route.snapshot.params.movieId }, write }));
        }
      });

      // remove this right from its sources parent's children list (destinationId)
      this.sources.map(s => {
        if (s.destinationId === id) {
          s.destinationId = '';
          promises.push(this.waterfallService.updateSource(this.route.snapshot.params.movieId, s, { write }));
        }
      });

      // then delete this right
      promises.push(this.rightService.remove(id, { params: { waterfallId: this.route.snapshot.params.movieId }, write }));
      await Promise.all(promises);
      await write.commit();

    } else {
      if (source.destinationId) {
        const rightChild = this.rights.find(right => right.id === source.destinationId);
        if (rightChild) {
          rightChild.nextIds = rightChild.nextIds.filter(id => id !== source.id);
          this.rightService.update(rightChild.id, rightChild, { params: { waterfallId: this.route.snapshot.params.movieId } });
        }
      }
      await this.waterfallService.removeSources(this.route.snapshot.params.movieId, [id]);
    }

    this.select('');
  }
}
