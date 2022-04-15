import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';

import { PreferencesComponent } from './preferences.component';

// Blockframes
import { PreferencesFormModule } from '@blockframes/auth/forms/preferences/preferences.module';
import { GlobalModalModule } from '@blockframes/ui/modal/modal.module';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';


@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    PreferencesFormModule,
    GlobalModalModule,
    MatButtonModule,
    MatIconModule
  ],
  declarations: [PreferencesComponent],
  exports: [PreferencesComponent]
})
export class PreferenceModule { }