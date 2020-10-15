import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

// Blockframes
import { MovieFormShootingInformationComponent } from './shooting-information.component';
import { TunnelPageModule } from '@blockframes/ui/tunnel';
import { StaticSelectModule } from '@blockframes/ui/static-autocomplete/select/static-select.module';
import { FormListModule } from '@blockframes/ui/form/list/form-list.module';
import { ToLabelModule } from '@blockframes/utils/pipes';

// Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';

@NgModule({
  declarations: [MovieFormShootingInformationComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    // Blockframes
    TunnelPageModule,
    StaticSelectModule,
    FormListModule,
    ToLabelModule,
    // Material
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatDatepickerModule,
    MatRadioModule,
    MatSelectModule,
    MatChipsModule,
    // Routes
    RouterModule.forChild([{ path: '', component: MovieFormShootingInformationComponent }]),
  ],
})
export class MovieFormShootingInformationModule { }
