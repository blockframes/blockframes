
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BlockframesGraphModule } from '@blockframes/ui/graph/graph.module';
import { CardModalModule } from '@blockframes/ui/card-modal/card-modal.module';

import { WaterfallGraphNodeModule } from './node/node.module';

import { WaterfallGraphComponent } from './graph.component';
import { WaterfallGraphLabelModule } from './label/label.module';


@NgModule({
  declarations: [ WaterfallGraphComponent ],
  imports: [
    CommonModule,

    CardModalModule,
    BlockframesGraphModule,
    WaterfallGraphNodeModule,
    WaterfallGraphLabelModule,
  ],
  exports: [ WaterfallGraphComponent ],
})
export class WaterfallGraphModule {}
