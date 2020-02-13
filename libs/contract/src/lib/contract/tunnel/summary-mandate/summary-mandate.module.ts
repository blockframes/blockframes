import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { SummaryMandateComponent } from './summary-mandate.component';

import { TunnelPageModule } from '@blockframes/ui/tunnel';
import { MovieBannerModule } from '@blockframes/movie/movie/components/banner';
import { RightListModule } from '@blockframes/movie/distribution-deals/components/right-list/right-list.module';
import { MissingControlModule } from '@blockframes/ui/missing-control/missing-control.module';

// Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';


@NgModule({
  declarations: [SummaryMandateComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    TunnelPageModule,
    MovieBannerModule,
    RightListModule,
    MissingControlModule,
    // Material
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    RouterModule.forChild([{ path: '', component: SummaryMandateComponent }])
  ]
})
export class SummaryMandateModule { }
