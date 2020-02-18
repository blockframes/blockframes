import { DealComponent } from './deal.component';

// Blockframes
import { DistributionDealBroadcastModule } from '@blockframes/movie/distribution-deals/form/broadcast/broadcast.module';
import { DistributionDealHoldbacksModule } from '@blockframes/movie/distribution-deals/form/holdbacks/holdbacks.module';
import { DistributionDealLanguagesModule } from '@blockframes/movie/distribution-deals/form/languages/languages.module';
import { DistributionDealTermsModule } from '@blockframes/movie/distribution-deals/form/terms/terms.module';
import { DistributionDealRightsModule } from '@blockframes/movie/distribution-deals/form/rights/rights.module';
import { DistributionDealTerritoryModule } from '@blockframes/movie/distribution-deals/form/territory/territory.module';
import { TunnelPageModule } from '@blockframes/ui/tunnel';
import { MovieBannerModule } from '@blockframes/movie/movie/components/banner';


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
    RouterModule.forChild([{ path: '', component: DealComponent }]),
    FlexLayoutModule,
    ReactiveFormsModule,

    // Component Modules
    TunnelPageModule,
    DistributionDealTerritoryModule,
    DistributionDealRightsModule,
    DistributionDealTermsModule,
    DistributionDealLanguagesModule,
    DistributionDealHoldbacksModule,
    MovieBannerModule,
    DistributionDealBroadcastModule,

    // Material
    MatExpansionModule,
    MatDividerModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
  ],
  declarations: [DealComponent]
})
export class DealModule { }
