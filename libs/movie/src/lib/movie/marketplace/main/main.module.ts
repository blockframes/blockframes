import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MainComponent } from './main.component';

import { ImageReferenceModule } from '@blockframes/media/directives/image-reference/image-reference.module';
import { TranslateSlugModule, DisplayNameModule, ToLabelModule, HasKeysModule } from '@blockframes/utils/pipes';

import { PrizeCardModule } from '../../components/prize-card/prize-card.module';
import { CreditCardModule } from '../../components/credit-card/credit-card.module';
import { ReviewCardModule } from '../../components/review-card/review-card.module';
import { MatLayoutModule } from '@blockframes/ui/layout/layout.module';
import { HasStatusModule } from '../../pipes/has-status.pipe';
import { DurationModule } from '@blockframes/utils/pipes/duration.pipe';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';

@NgModule({
  declarations: [MainComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    TranslateSlugModule,
    DisplayNameModule,
    HasKeysModule,
    ToLabelModule,
    HasStatusModule,
    ImageReferenceModule,
    MatLayoutModule,
    PrizeCardModule,
    CreditCardModule,
    ReviewCardModule,
    DurationModule,
    // Material
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatDividerModule,
    RouterModule.forChild([{ path: '', component: MainComponent }])
  ]
})
export class MovieMainModule { }
