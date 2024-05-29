import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { MarketplaceSelectionComponent } from './selection.component';
import { GetTitlePipeModule } from '@blockframes/movie/pipes/get-title.pipe';
import { BucketPipesModule } from '@blockframes/contract/bucket/pipes';
import { JoinPipeModule } from '@blockframes/utils/pipes';
import { ContractItemModule } from '@blockframes/contract/contract/components/item/contract-item.module';
import { HoldbackFormModule } from '@blockframes/contract/contract/holdback/form/form.module';
import { StaticSelectModule } from '@blockframes/ui/static-autocomplete/select/static-select.module';
import { LogoSpinnerModule } from '@blockframes/ui/logo-spinner/logo-spinner.module';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatDividerModule } from '@angular/material/divider';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';

@NgModule({
  declarations: [MarketplaceSelectionComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ImageModule,
    GetTitlePipeModule,
    BucketPipesModule,
    JoinPipeModule,
    StaticSelectModule,
    ContractItemModule,
    HoldbackFormModule,
    LogoSpinnerModule,
    // Material
    MatButtonModule,
    MatTooltipModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
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
