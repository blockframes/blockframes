import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MainComponent } from './main.component';

import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { DisplayNameModule, ToLabelModule, HasKeysModule } from '@blockframes/utils/pipes';
import { RunningTimePipeModule } from '@blockframes/movie/pipes/running-time.pipe';
import { MatLayoutModule } from '@blockframes/ui/layout/layout.module';
import { VideoViewerModule } from '@blockframes/media/video/viewer/viewer.module';

import { PrizeCardModule } from '../../components/prize-card/prize-card.module';
import { CreditCardModule } from '../../components/credit-card/credit-card.module';
import { ReviewCardModule } from '../../components/review-card/review-card.module';
import { HasStatusModule } from '../../pipes/has-status.pipe';

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
    DisplayNameModule,
    HasKeysModule,
    ToLabelModule,
    HasStatusModule,
    ImageModule,
    MatLayoutModule,
    PrizeCardModule,
    CreditCardModule,
    ReviewCardModule,
    RunningTimePipeModule,
    VideoViewerModule,
    // Material
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatDividerModule,
    RouterModule.forChild([{ path: '', component: MainComponent }])
  ]
})
export class MovieMainModule { }
