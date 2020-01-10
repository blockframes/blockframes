import { MovieFormFormatModule } from '@blockframes/movie/movie/form/sales-info/format/format.module';
import { MovieFormVersionInfoModule } from '@blockframes/movie/movie/form/version-info/version-info.module';
import { TunnelTechnicalInfoComponent } from './technical-info.component';
import { TunnelPageModule } from '@blockframes/ui/tunnel/page/tunnel-page.module';

// Angular
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

// Materials
import { MatCardModule } from '@angular/material/card';

@NgModule({
  declarations: [TunnelTechnicalInfoComponent],
  imports: [
    ReactiveFormsModule,
    TunnelPageModule,
    FlexLayoutModule,
    MovieFormFormatModule,
    MovieFormVersionInfoModule,

    // Material
    MatCardModule,

    // Route
    RouterModule.forChild([{ path: '', component: TunnelTechnicalInfoComponent }]),
  ],
  exports: [TunnelTechnicalInfoComponent]
})
export class TunnelTechnicalInfoModule {}
