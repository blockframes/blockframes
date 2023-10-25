import { AfterViewInit, ChangeDetectionStrategy, Component, Input, OnChanges, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { map, Observable } from 'rxjs';
import { ComboConfig, EdgeConfig, GraphData, IG6GraphEvent, NodeConfig } from '@antv/g6';
import { toG6 } from '../../g6/utils';
import {
  OrgState,
  RightState,
  TransferState,
  TitleState,
  History,
  WaterfallRightholder,
  VerticalState,
  HorizontalState,
  mainCurrency
} from '@blockframes/model';

@Component({
  selector: 'waterfall-g6-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GraphComponent implements OnInit, AfterViewInit, OnChanges {
  control: FormControl;
  history: History[] = [];
  data$?: Observable<GraphData>;
  state$?: Observable<History>;
  graphs: GraphData[] = [];
  transfer?: TransferState;
  right?: RightState;
  verticalGroup?: VerticalState;
  horizontalGroup?: HorizontalState;
  org?: OrgState;
  currency = mainCurrency;

  @Input() tree?: { state: TitleState, history: History[] };
  @Input() hideDetails = false;
  @Input() rightholders?: WaterfallRightholder[] = [];

  constructor() {
    this.control = new FormControl(0, { nonNullable: true });
  }

  get state() {
    return this.history[this.control.value];
  }

  async ngOnInit() {
    if (this.tree) this.history = this.tree.history;

    this.graphs = this.history.map(h => toG6(h));

    this.data$ = this.control.valueChanges.pipe(map(index => this.graphs[index]));
    this.state$ = this.control.valueChanges.pipe(map(index => this.history[index]));
  }

  async ngOnChanges() {
    if (this.tree) this.history = this.tree.history;

    this.graphs = this.history.map(h => toG6(h));

    this.control.setValue(this.history.length - 1);
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
        this.verticalGroup = this.state.verticals[id];
        this.horizontalGroup = this.state.horizontals[id];
        break;
      }
    }
  }

  orgDetails(orgId: string) {
    this.unselect();
    this.org = this.state.orgs[orgId];
  }

  getRightholderName(id: string) {
    if (!id) return '--';
    return this.rightholders.find(r => r.id === id)?.name || id;
  }

  unselect() {
    this.transfer = undefined;
    this.right = undefined;
    this.org = undefined;
    this.verticalGroup = undefined;
    this.horizontalGroup = undefined;
  }

  trackBy(_: number, item: NodeConfig | EdgeConfig | ComboConfig) {
    return `${item.id}${item.label}`;
  }
}
