import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { TunnelPageModule } from '@blockframes/ui/tunnel/page/tunnel-page.module';
import { CreditsComponent } from './credits.component';
import { MovieFormProductionYearModule } from '@blockframes/movie/movie/form/main/production-year/production-year.module';
import { MovieFormStakeholdersModule } from '@blockframes/movie/movie/form/main/stakeholders/stakeholders.module';
import { MovieFormSalesCastModule } from '@blockframes/movie/movie/form/sales-cast/sales-cast.module';

// Material
import { MatExpansionModule } from '@angular/material/expansion';

@NgModule({
    declarations: [CreditsComponent],
    imports: [
      CommonModule,
      ReactiveFormsModule,
      TunnelPageModule,
      // Form Module
      MovieFormProductionYearModule,
      MovieFormStakeholdersModule,
      MovieFormSalesCastModule,
      // Material
      MatExpansionModule,
      // Route
      RouterModule.forChild([{ path: '', component: CreditsComponent }])
    ]
  })
  export class CreditsModule { }
