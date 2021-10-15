// Agnular
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

// Blockframes
import { InputAutocompleteModule } from '@blockframes/ui/static-autocomplete/input/input-autocomplete.module';

// Components
import { MovieFormAvailableVersionsComponent } from './available-versions.component';
import { TunnelPageModule } from '@blockframes/ui/tunnel';
import { LanguagesFormModule } from '../languages/languages.module';

// Material
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
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
    LanguagesFormModule,

    RouterModule.forChild([{ path: '', component: MovieFormAvailableVersionsComponent }]),

    // Material
    MatCheckboxModule,
    MatSlideToggleModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule

  ],
  declarations: [MovieFormAvailableVersionsComponent],
})
export class MovieFormAvailableVersionsModule { }
