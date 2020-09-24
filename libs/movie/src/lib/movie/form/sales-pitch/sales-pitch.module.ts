import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

// Blockframes UI
import { TunnelPageModule } from '@blockframes/ui/tunnel';
import { FormListModule } from '@blockframes/ui/form/list/form-list.module';
import { StaticSelectModule } from '@blockframes/ui/static-autocomplete/select/static-select.module';

// Blockframes Media
import { UploadModule } from '@blockframes/media/components/upload/upload.module';

import { MovieFormSalesPitchComponent } from './sales-pitch.component';


@NgModule({
  declarations: [MovieFormSalesPitchComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TunnelPageModule,
    UploadModule,
    FlexLayoutModule,
    FormListModule,
    StaticSelectModule,

    // Material
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    RouterModule.forChild([{ path: '', component: MovieFormSalesPitchComponent }])
  ],
  exports: [MovieFormSalesPitchComponent]
})
export class MovieFormSalesPitchModule { }
