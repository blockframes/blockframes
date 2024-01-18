
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';

import { BlockframesGraphModule } from '@blockframes/ui/graph/graph.module';
import { CardModalModule } from '@blockframes/ui/card-modal/card-modal.module';
import { AutocompleteModule } from '@blockframes/ui/autocomplete/autocomplete.module';
import { GroupMultiselectModule } from '@blockframes/ui/static-autocomplete/group/group.module';

import { WaterfallGraphComponent } from './graph.component';
import { WaterfallGraphNodeModule } from './node/node.module';
import { WaterfallGraphLabelModule } from './label/label.module';
import { WaterfallPoolListModule } from './pool-list/pool-list.module';
import { WaterfallRightListModule } from './right-list/right-list.module';
import { WaterfallConditionsModule } from './conditions/conditions.module';
import { WaterfallDeleteRightModalModule } from './delete-right-modal/delete-right-modal.module';


@NgModule({
  declarations: [ WaterfallGraphComponent ],
  imports: [
    ReactiveFormsModule,
    CommonModule,

    CardModalModule,
    AutocompleteModule,
    GroupMultiselectModule,
    BlockframesGraphModule,
    WaterfallPoolListModule,
    WaterfallGraphNodeModule,
    WaterfallRightListModule,
    WaterfallGraphLabelModule,
    WaterfallConditionsModule,
    WaterfallDeleteRightModalModule,

    MatIconModule,
    MatTabsModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatFormFieldModule,
  ],
  exports: [ WaterfallGraphComponent ],
})
export class WaterfallGraphModule {}
