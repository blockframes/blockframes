import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

// Components
import { GeneralInformationComponent } from './general-information.component';

// Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ChipsAutocompleteModule } from '@blockframes/ui/static-autocomplete/chips/chips-autocomplete.module';
import { MovieFormGenresModule } from '../genres/genres.module';
import { MovieFormTotalRuntimeModule } from '../total-runtime/total-runtime.module';

@NgModule({
  declarations: [GeneralInformationComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FlexLayoutModule,

    // Material
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ChipsAutocompleteModule,
    MovieFormGenresModule,
    MovieFormTotalRuntimeModule,
  ],
  exports: [GeneralInformationComponent]
})
export class MovieFormGeneralInformationModule { }
