import { NgModule } from '@angular/core';
import {
  ContractItemComponent,
 } from './contract-item.component';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { GetTitlePipeModule } from '@blockframes/movie/pipes/get-title.pipe';
import { StorageFileModule } from '@blockframes/media/pipes/storageFile.pipe'
import { DisplayNameModule } from '@blockframes/utils/pipes/display-name.pipe';
import { RouterModule } from '@angular/router';
import { MovieFeatureModule } from '@blockframes/movie/pipes/movie-feature.pipe';
import { GetTitleHoldbacksPipeModule } from '@blockframes/movie/pipes/get-title-holdbacks';
import { JoinPipeModule, VersionPipeModule, ToGroupLabelPipeModule, ToLabelModule } from '@blockframes/utils/pipes';
import { HoldbackModalModule } from '../../holdback/modal/holdback-modal.module';
import { CollidingHoldbacksPipeModule } from '@blockframes/contract/contract/holdback/pipes/colliding-holdback.pipe'
import { TableModule } from '@blockframes/ui/list/table/table.module';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { TermPipeModule } from '@blockframes/contract/term/pipes';
import { DetailedGroupModule } from '@blockframes/ui/detail-modal/detailed.module';



@NgModule({
  declarations: [
    ContractItemComponent,
  ],
  imports: [
    CommonModule,
    FlexLayoutModule,
    RouterModule,
    GetTitlePipeModule,
    ImageModule,
    StorageFileModule,
    TableModule,
    DisplayNameModule,
    MovieFeatureModule,
    ToGroupLabelPipeModule,
    JoinPipeModule,
    VersionPipeModule,
    ToLabelModule,
    GetTitleHoldbacksPipeModule,
    TermPipeModule,
    HoldbackModalModule,
    CollidingHoldbacksPipeModule,
    DetailedGroupModule,

    // Material
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatSelectModule,
    MatSnackBarModule,
    MatTooltipModule,
    ],
  exports:[
    ContractItemComponent,
  ],
})
export class ContractItemModule { }
