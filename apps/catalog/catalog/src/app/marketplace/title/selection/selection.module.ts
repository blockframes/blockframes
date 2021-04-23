import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';
import { MarketplaceSelectionComponent } from './selection.component';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { GetTitlePipeModule } from '@blockframes/movie/pipes/get-title.pipe';
import { StorageFileModule } from '@blockframes/media/pipes/storageFile.pipe'
import { BucketPipesModule } from '@blockframes/contract/bucket/pipes';
import { DeepKeyPipeModule } from '@blockframes/utils/pipes';
import { TableFilterModule } from '@blockframes/ui/list/table-filter/table-filter.module';
import { DisplayNameModule } from '@blockframes/utils/pipes/display-name.pipe';
import { MovieFeatureModule } from '@blockframes/movie/pipes/movie-feature.pipe';
import { ToLabelModule } from '@blockframes/utils/pipes';
import { DetailedTermsModule } from '@blockframes/contract/term/components/detailed/detailed.module';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@NgModule({
  declarations: [MarketplaceSelectionComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,

    GetTitlePipeModule,
    BucketPipesModule,
    DeepKeyPipeModule,
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

    RouterModule.forChild([
      {
        path: '',
        component: MarketplaceSelectionComponent
      },
      {
        path: 'congratulations',
        loadChildren: () => import('./congratulations/congratulations.module').then(m => m.CongratulationsModule)
      }
    ])
  ]
})
export class SelectionModule { }
