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
import { DetailedTermsModule } from '@blockframes/contract/term/components/detailed/detailed.module';
import { HoldbackModalModule } from '../../holdback/modal/holdback-modal.module';
import { CollidingHoldbacksPipeModule } from '@blockframes/contract/contract/holdback/pipes/colliding-holdback.pipe'
import { TableModule } from '@blockframes/ui/list/table/table.module';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TermPipeModule } from '@blockframes/contract/term/pipes';



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
    DetailedTermsModule,
    JoinPipeModule,
    VersionPipeModule,
    ToLabelModule,
    GetTitleHoldbacksPipeModule,
    TermPipeModule,
    HoldbackModalModule,
    CollidingHoldbacksPipeModule,

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
