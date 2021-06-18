import { NgModule } from '@angular/core';
import {
  ContractItemComponent,
 } from './contract-item.component';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { GetTitlePipeModule } from '@blockframes/movie/pipes/get-title.pipe';
import { StorageFileModule } from '@blockframes/media/pipes/storageFile.pipe'
import { BucketPipesModule } from '@blockframes/contract/bucket/pipes';
import { DeepKeyPipeModule } from '@blockframes/utils/pipes';
import { TableFilterModule } from '@blockframes/ui/list/table-filter/table-filter.module';
import { DisplayNameModule } from '@blockframes/utils/pipes/display-name.pipe';
import { RouterModule } from '@angular/router';
import { MovieFeatureModule } from '@blockframes/movie/pipes/movie-feature.pipe';
import { ToLabelModule } from '@blockframes/utils/pipes';
import { DetailedTermsModule } from '@blockframes/contract/term/components/detailed/detailed.module';
import { StaticSelectModule } from '@blockframes/ui/static-autocomplete/select/static-select.module';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';



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
    TableFilterModule,
    DisplayNameModule,
    MovieFeatureModule,
    ToLabelModule,
    DetailedTermsModule,

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
  ]
})
export class ContractItemModule { }
