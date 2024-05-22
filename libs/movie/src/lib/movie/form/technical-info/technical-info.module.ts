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
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';

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
export class TunnelTechnicalInfoModule {}
