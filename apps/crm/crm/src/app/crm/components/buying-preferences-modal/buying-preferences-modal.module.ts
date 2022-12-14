import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';

import { BuyingPreferencesModalComponent } from './buying-preferences-modal.component';

// Blockframes
import { PreferencesFormModule } from '@blockframes/auth/forms/preferences/preferences.module';
import { GlobalModalModule } from '@blockframes/ui/global-modal/global-modal.module';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DisplayNameModule } from '@blockframes/utils/pipes';


@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    PreferencesFormModule,
    GlobalModalModule,
    MatButtonModule,
    MatIconModule,
    DisplayNameModule,
  ],
  declarations: [BuyingPreferencesModalComponent],
  exports: [BuyingPreferencesModalComponent]
})
export class BuyingPreferencesModalModule { }
