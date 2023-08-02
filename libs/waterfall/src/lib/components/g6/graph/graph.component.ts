import { AfterViewInit, ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { map, Observable } from 'rxjs';
import { ComboConfig, EdgeConfig, GraphData, IG6GraphEvent, NodeConfig } from '@antv/g6';
import { toG6 } from '../../g6/utils';
import { OrgState, RightState, TransferState, TitleState, History, WaterfallRightholder } from '@blockframes/model';
import { WaterfallService } from '@blockframes/waterfall/waterfall.service';

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
  rightholders: WaterfallRightholder[] = [];

  @Input() tree?: { state: TitleState, history: History[] };
  @Input() hideDetails = false;
  @Input() waterfallId : string;

  constructor(private waterfallService: WaterfallService) {
    this.control = new FormControl(0, { nonNullable: true });
  }

  get state() {
    return this.history[this.control.value];
  }

  async ngOnInit() {
    if (this.tree) this.history = this.tree.history;

    this.graphs = this.history.map(h => toG6(h));

    this.data$ = this.control.valueChanges.pipe(map(index => this.graphs[index]));

    if(this.waterfallId){
      const waterfall = await this.waterfallService.getValue(this.waterfallId);
      this.rightholders = waterfall.rightholders;
    }

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

  orgDetails(orgId: string){
    this.unselect();
    this.org = this.state.orgs[orgId];
  }

  getRightholderName(id: string) {
    if (!id) return '--';
    return this.rightholders .find(r => r.id === id)?.name || id;
  }

  unselect() {
    this.transfer = undefined;
    this.right = undefined;;
    this.org = undefined;;
  }

  trackBy(_: number, item: NodeConfig | EdgeConfig | ComboConfig) {
    return `${item.id}${item.label}`;
  }
}
