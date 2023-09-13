// Angular
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

// Blockframes
import { RightHolderAddModule } from '@blockframes/waterfall/components/right-holder-add/right-holder-add.module';
import { TableModule } from '@blockframes/ui/list/table/table.module';
import { DisplayNameModule, ToLabelModule } from '@blockframes/utils/pipes';
import { GetOrgPipeModule } from '@blockframes/organization/pipes/get-org.pipe';
import { TagModule } from '@blockframes/ui/tag/tag.module';

// Pages
import { RightHoldersComponent } from './right-holders.component';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@NgModule({
  declarations: [RightHoldersComponent],
  imports: [
    CommonModule,

    // Blockframes
    RightHolderAddModule,
    TableModule,
    DisplayNameModule,
    GetOrgPipeModule,
    ToLabelModule,
    TagModule,

    // Material
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatSnackBarModule,

    // Routing
    RouterModule.forChild([{ path: '', component: RightHoldersComponent }])
  ]
})
export class RightHoldersModule { } // TODO #9257 unused component/module : keep it for when we implement real rightholder management (aka real org) ?
