
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

// Components
import { GetGroupPipe, GetNodePipe, WaterfallGraphComponent } from './graph.component';

// Blockframes
import { BfCommonModule } from '@blockframes/utils/bf-common.module';
import { BlockframesGraphModule } from '@blockframes/ui/graph/graph.module';
import { CardModalModule } from '@blockframes/ui/card-modal/card-modal.module';
import { AutocompleteModule } from '@blockframes/ui/autocomplete/autocomplete.module';
import { GroupMultiselectModule } from '@blockframes/ui/static-autocomplete/group/group.module';
import { StaticSelectModule } from '@blockframes/ui/static-autocomplete/select/static-select.module';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { WaterfallGraphNodeModule } from './node/node.module';
import { WaterfallGraphLabelModule } from './label/label.module';
import { WaterfallPoolListModule } from './pool-list/pool-list.module';
import { WaterfallRightListModule } from './right-list/right-list.module';
import { WaterfallConditionsModule } from './conditions/conditions.module';
import { WaterfallGraphNodeDetailsModule } from './node-details/node-details.module';
import { ConfirmModule } from '@blockframes/ui/confirm/confirm.module';
import { GraphNodePipeModule } from '../../pipes/graph-node-pipe';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';

@NgModule({
  declarations: [WaterfallGraphComponent, GetNodePipe, GetGroupPipe],
  imports: [
    ReactiveFormsModule,
    BfCommonModule,
    RouterModule,

    CardModalModule,
    AutocompleteModule,
    GroupMultiselectModule,
    BlockframesGraphModule,
    StaticSelectModule,
    WaterfallPoolListModule,
    WaterfallGraphNodeModule,
    WaterfallRightListModule,
    WaterfallGraphLabelModule,
    WaterfallConditionsModule,
    WaterfallGraphNodeDetailsModule,
    ConfirmModule,
    ImageModule,
    GraphNodePipeModule,

    MatIconModule,
    MatTabsModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatFormFieldModule,
  ],
  exports: [WaterfallGraphComponent],
})
export class WaterfallGraphModule { }
