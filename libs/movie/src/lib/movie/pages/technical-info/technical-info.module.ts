// Blockframes
import { MovieFormTechnicalInfoComponent } from './technical-info.component';
import { StaticSelectModule } from '@blockframes/ui/static-autocomplete/select/static-select.module';
import { TunnelPageModule } from '@blockframes/ui/tunnel';

// Angular
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

// Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

@NgModule({
  declarations: [MovieFormTechnicalInfoComponent],
  imports: [
    ReactiveFormsModule,
    TunnelPageModule,
    FlexLayoutModule,
    StaticSelectModule,

    // Material
    MatFormFieldModule,
    MatSelectModule,

    // Route
    RouterModule.forChild([{ path: '', component: MovieFormTechnicalInfoComponent }]),
  ],
  exports: [MovieFormTechnicalInfoComponent]
})
export class MovieFormTunnelTechnicalInfoModule {}
