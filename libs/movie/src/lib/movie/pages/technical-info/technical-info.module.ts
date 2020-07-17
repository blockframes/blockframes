import { MovieFormFormatModule } from '@blockframes/movie/form/sales-info/format/format.module';
import { MovieFormVersionInfoModule } from '@blockframes/movie/form/version-info/version-info.module';
import { MovieFormTechnicalInfoComponent } from './technical-info.component';
import { TunnelPageModule } from '@blockframes/ui/tunnel';

// Angular
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

// Materials
import { MatCardModule } from '@angular/material/card';

@NgModule({
  declarations: [MovieFormTechnicalInfoComponent],
  imports: [
    ReactiveFormsModule,
    TunnelPageModule,
    FlexLayoutModule,
    MovieFormFormatModule,
    MovieFormVersionInfoModule,

    // Material
    MatCardModule,

    // Route
    RouterModule.forChild([{ path: '', component: MovieFormTechnicalInfoComponent }]),
  ],
  exports: [MovieFormTechnicalInfoComponent]
})
export class TunnelTechnicalInfoModule {}
