import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule } from "@angular/forms";

import { PreferencesFormComponent } from './preferences.component';

// Blockframes
import { ChipsAutocompleteModule } from '@blockframes/ui/static-autocomplete/chips/chips-autocomplete.module';
import { GroupMultiselectModule } from '@blockframes/ui/static-autocomplete/group/group.module';

// Material
import { MatFormFieldModule } from '@angular/material/form-field';


@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,

    ChipsAutocompleteModule,
    GroupMultiselectModule,

    MatFormFieldModule
  ],
  declarations: [
    PreferencesFormComponent
  ],
  exports: [
    PreferencesFormComponent
  ]
})
export class PreferencesFormModule { }