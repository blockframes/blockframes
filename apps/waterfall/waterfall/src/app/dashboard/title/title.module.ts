// Angular
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

//Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

// Pages
import { TitleComponent } from './title.component';

// Modules

import { MatTooltipModule } from '@angular/material/tooltip';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ChipsAutocompleteModule } from '@blockframes/ui/static-autocomplete/chips/chips-autocomplete.module';

@NgModule({
  declarations: [TitleComponent],
  imports: [
    CommonModule,
    ChipsAutocompleteModule,

    // Material
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,

    // Routing
    RouterModule.forChild([{ path: '', component: TitleComponent }])
  ]
})
export class TitleModule { }
