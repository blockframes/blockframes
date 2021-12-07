import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';

import { PreferencesComponent } from './preferences.component';

// Blockframes
import { PreferencesFormModule } from '@blockframes/auth/forms/preferences/preferences.module';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';


@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    PreferencesFormModule,
    MatButtonModule,
    MatIconModule
  ],
  declarations: [PreferencesComponent]
})
export class PreferenceModule { }