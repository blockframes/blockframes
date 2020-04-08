import { RightComponent } from './right.component';

// Blockframes
import { DistributionRightBroadcastModule } from '@blockframes/distribution-rights/form/broadcast/broadcast.module';
import { DistributionRightHoldbacksModule } from '@blockframes/distribution-rights/form/holdbacks/holdbacks.module';
import { DistributionRightLanguagesModule } from '@blockframes/distribution-rights/form/languages/languages.module';
import { DistributionRightTermsModule } from '@blockframes/distribution-rights/form/terms/terms.module';
import { DistributionRightRightsModule } from '@blockframes/distribution-rights/form/rights/rights.module';
import { DistributionRightTerritoryModule } from '@blockframes/distribution-rights/form/territory/territory.module';
import { TunnelPageModule } from '@blockframes/ui/tunnel';
import { MovieBannerModule } from '@blockframes/movie/components/banner';


// Angular
import { FlexLayoutModule } from '@angular/flex-layout';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

// Material
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([{ path: '', component: RightComponent }]),
    FlexLayoutModule,
    ReactiveFormsModule,

    // Component Modules
    TunnelPageModule,
    DistributionRightTerritoryModule,
    DistributionRightRightsModule,
    DistributionRightTermsModule,
    DistributionRightLanguagesModule,
    DistributionRightHoldbacksModule,
    MovieBannerModule,
    DistributionRightBroadcastModule,

    // Material
    MatExpansionModule,
    MatDividerModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
  ],
  declarations: [RightComponent]
})
export class RightModule { }
