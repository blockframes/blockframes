import { NgModule } from '@angular/core';

// Components
import { WaterfallGraphReadOnlyComponent } from './read-only.component';

// Blockframes
import { BfCommonModule } from '@blockframes/utils/bf-common.module';
import { BlockframesGraphModule } from '@blockframes/ui/graph/graph.module';
import { CardModalModule } from '@blockframes/ui/card-modal/card-modal.module';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { WaterfallGraphNodeModule } from './../node/node.module';
import { WaterfallGraphLabelModule } from './../label/label.module';
import { WaterfallGraphNodeDetailsModule } from './../node-details/node-details.module';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [WaterfallGraphReadOnlyComponent],
  imports: [
    BfCommonModule,

    CardModalModule,
    BlockframesGraphModule,
    WaterfallGraphNodeModule,
    WaterfallGraphLabelModule,
    WaterfallGraphNodeDetailsModule,
    ImageModule,

    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
  ],
  exports: [WaterfallGraphReadOnlyComponent],
})
export class WaterfallGraphReadOnlyModule { }
