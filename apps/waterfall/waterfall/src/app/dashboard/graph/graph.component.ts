// Angular
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

// Blockframes
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { waterfall } from '@blockframes/waterfall/main';
import { TitleState, History } from '@blockframes/model';

import { actions as realityGroup } from '@blockframes/waterfall/fixtures/reality-group';
import { actions as rubberGroup } from '@blockframes/waterfall/fixtures/rubber-group';
import { actions as terrawillyGroup } from '@blockframes/waterfall/fixtures/terrawilly-group';
import { actions as casablancasV2 } from '@blockframes/waterfall/fixtures/casablancas-v2';
import { actions as origineDuMal } from '@blockframes/waterfall/fixtures/origine-du-mal';
import { actions as blameExample } from '@blockframes/waterfall/fixtures/examples/blame-example';

@Component({
  selector: 'dashboard-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GraphComponent { // TODO #9485 remove
  private actions = {
    'casablancas-v2': casablancasV2,
    'reality-group': realityGroup,
    'rubber-group': rubberGroup,
    'terrawilly-group': terrawillyGroup,
    'origine-du-mal': origineDuMal,
    'blame-example': blameExample,
  }
  private waterfallId: keyof typeof this.actions = this.route.snapshot.params['waterfallId'];

  tree: { state: TitleState, history: History[] };

  constructor(
    private dynTitle: DynamicTitleService,
    private route: ActivatedRoute,
  ) {
    this.dynTitle.setPageTitle('Graph');
    this.tree = waterfall(this.waterfallId, this.actions[this.waterfallId]);
  }

}
