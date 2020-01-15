import { TunnelPageModule } from '@blockframes/ui/tunnel/page/tunnel-page.module';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TunnelMarketplaceRightsComponent } from './marketplace-rights.component';
import { MatCardModule } from '@angular/material/card';

@NgModule({
  imports: [
    CommonModule,
    TunnelPageModule,
    RouterModule.forChild([{ path: '', component: TunnelMarketplaceRightsComponent }]),

    // Material
    MatCardModule
  ],
  declarations: [TunnelMarketplaceRightsComponent]
})
export class TunnelMarketplaceRightsModule {}
