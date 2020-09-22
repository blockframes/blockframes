import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ArtisticComponent } from './artistic.component';

import { CreditCardModule } from '../../components/credit-card/credit-card.module';
import { MatLayoutModule } from '@blockframes/ui/layout/layout.module';
import { HasKeysModule } from '@blockframes/utils/pipes';

import { MatDividerModule } from '@angular/material/divider';

@NgModule({
  declarations: [ArtisticComponent],
  imports: [
    CommonModule,
    CreditCardModule,
    MatLayoutModule,
    HasKeysModule,
    MatDividerModule,
    RouterModule.forChild([{ path: '', component: ArtisticComponent }])
  ]
})
export class MovieArtisticModule { }
