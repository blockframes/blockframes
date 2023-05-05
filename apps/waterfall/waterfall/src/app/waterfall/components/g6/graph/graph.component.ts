import { AfterViewInit, ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { map, Observable } from 'rxjs';
import { ComboConfig, EdgeConfig, GraphData, IG6GraphEvent, NodeConfig } from '@antv/g6';
import { toG6 } from '../../g6/utils';
import { History } from '@blockframes/waterfall/main';
import { OrgState, RightState, TransferState, TitleState } from '@blockframes/waterfall/state';

@Component({
  selector: 'waterfall-g6-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GraphComponent implements OnInit, AfterViewInit {
  control: FormControl;
  history: History[] = [];
  data$?: Observable<GraphData>;
  graphs: GraphData[] = [];
  transfer?: TransferState;
  right?: RightState;
  org?: OrgState;

  @Input() tree?: { state: TitleState, history: History[] };
  @Input() hideDetails = false;

  constructor() {
    this.control = new FormControl(0, { nonNullable: true });
  }

  get state() {
    return this.history[this.control.value];
  }

  ngOnInit() {
    if (this.tree) this.history = this.tree.history;

    this.graphs = this.history.map(h => toG6(h));

    this.data$ = this.control.valueChanges.pipe(map(index => this.graphs[index]));
  }

  ngAfterViewInit() {
    this.control.setValue(this.history.length - 1);
  }

  select(event: IG6GraphEvent) {
    this.hideDetails = false;
    if (!event.item) throw new Error('Undefined event');
    this.unselect();
    const id = event.item.getID();
    switch (event.item.getType()) {
      case 'edge': {
        this.transfer = this.state.transfers[id as `${string}->${string}`];
        break;
      };
      case 'node': {
        this.right = this.state.rights[id];
        break;
      };
      case 'combo': {
        this.org = this.state.orgs[id];
        break;
      }
    }
  }

  unselect() {
    delete this.transfer;
    delete this.right;
    delete this.org;
  }

  trackBy(_: number, item: NodeConfig | EdgeConfig | ComboConfig) {
    return `${item.id}${item.label}`;
  }
}
