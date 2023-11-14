
import { BehaviorSubject } from 'rxjs';
import { ChangeDetectionStrategy, Component, Input, OnInit, ViewChild } from '@angular/core';

import { Right, WaterfallSource } from '@blockframes/model';
import { GraphService } from '@blockframes/ui/graph/graph.service';
import { TitleState, WaterfallRightholder } from '@blockframes/model';
import { CardModalComponent } from '@blockframes/ui/card-modal/card-modal.component';

import { Arrow, Node, toGraph } from './layout';


@Component({
  selector: 'waterfall-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WaterfallGraphComponent implements OnInit {

  @Input() state: TitleState;
  @Input() rights: Right[];
  @Input() rightholders: WaterfallRightholder[];
  @Input() sources: WaterfallSource[];

  @ViewChild(CardModalComponent) cardModal: CardModalComponent;

  selected$ = new BehaviorSubject<string>('');
  nodes$ = new BehaviorSubject<Node[]>([]);
  arrows$ = new BehaviorSubject<Arrow[]>([]);

  constructor(
    private service: GraphService,
  ) { }

  ngOnInit() {
    this.layout();
  }

  select(id: string) {
    this.selected$.next(id);
  }

  async layout() {
    const { nodes, arrows, bounds } = await toGraph(this.rights, this.sources, this.state, this.rightholders);
    this.service.updateBounds(bounds);
    this.nodes$.next(nodes);
    this.arrows$.next(arrows);
  }
}
