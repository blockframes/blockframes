import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';

import { PerkCardComponent } from './perk-card.component';

import { MaxLengthModule } from '@blockframes/utils/pipes';
import { PerksPipeModule } from '@blockframes/campaign/pipes/perks.pipe';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';

@NgModule({
  declarations: [PerkCardComponent],
  exports: [PerkCardComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ImageModule,
    PerksPipeModule,
    MaxLengthModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule
  ]
})
export class PerkCardModule { }
