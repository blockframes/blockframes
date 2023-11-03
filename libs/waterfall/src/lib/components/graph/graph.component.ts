
import { BehaviorSubject } from 'rxjs';
import { ChangeDetectionStrategy, Component, Input, OnInit, ViewChild } from '@angular/core';

import { TitleState } from '@blockframes/model';
import { Right, WaterfallSource } from '@blockframes/model';
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
  @Input() sources: WaterfallSource[];

  @ViewChild(CardModalComponent) cardModal: CardModalComponent;

  selected$ = new BehaviorSubject<string>('');
  nodes$ = new BehaviorSubject<Node[]>([]);
  arrows$ = new BehaviorSubject<Arrow[]>([]);


  ngOnInit() {
    this.layout();
  }

  select(id: string) {
    this.selected$.next(id);
  }

  async layout() {
    const { nodes, arrows } = await toGraph(this.rights, this.sources, this.state);
    this.nodes$.next(nodes);
    this.arrows$.next(arrows);
  }
}
