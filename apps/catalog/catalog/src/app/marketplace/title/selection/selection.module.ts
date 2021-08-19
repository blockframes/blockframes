import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { MarketplaceSelectionComponent } from './selection.component';
import { GetTitlePipeModule } from '@blockframes/movie/pipes/get-title.pipe';
import { GetTitleHoldbacksPipeModule } from '@blockframes/movie/pipes/get-title-holdbacks';
import { BucketPipesModule } from '@blockframes/contract/bucket/pipes';
import { DeepKeyPipeModule } from '@blockframes/utils/pipes';
import { ContractItemModule } from '@blockframes/contract/contract/item/contract-item.module';
import { HoldbackFormModule } from '@blockframes/contract/contract/holdback/form/form.module';
import { StaticSelectModule } from '@blockframes/ui/static-autocomplete/select/static-select.module';
import { CollidingHoldbacksPipeModule } from '@blockframes/contract/contract/holdback/pipes/colliding-holdback.pipe'

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';

@NgModule({
  declarations: [MarketplaceSelectionComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ImageModule,
    GetTitlePipeModule,
    BucketPipesModule,
    DeepKeyPipeModule,
    StaticSelectModule,
    CollidingHoldbacksPipeModule,
    ContractItemModule,
    HoldbackFormModule,
    GetTitleHoldbacksPipeModule,

    // Material
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatSelectModule,
    MatDividerModule,
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
