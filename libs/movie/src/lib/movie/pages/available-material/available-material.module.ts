// Agnular
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

// Blockframes
import { InputAutocompleteModule } from '@blockframes/ui/static-autocomplete/input/input-autocomplete.module';

// Components
import { MovieFormAvailableMaterialComponent } from './available-material.component';
import { TunnelPageModule } from '@blockframes/ui/tunnel';

// Material
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

@NgModule({
  imports: [
    CommonModule,
    TunnelPageModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    InputAutocompleteModule,

    RouterModule.forChild([{ path: '', component: MovieFormAvailableMaterialComponent }]),

    // Material
    MatCheckboxModule,
    MatSlideToggleModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule
    
  ],
  declarations: [MovieFormAvailableMaterialComponent],
})
export class MovieFormAvailableMaterialModule { }
