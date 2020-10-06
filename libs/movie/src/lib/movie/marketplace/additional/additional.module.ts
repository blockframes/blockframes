import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdditionalComponent } from './additional.component';
import { TranslateSlugModule, HasKeysModule, ToLabelModule } from '@blockframes/utils/pipes';
import { HasStatusModule } from '../../pipes/has-status.pipe';

import { FlexLayoutModule } from '@angular/flex-layout';
// Material
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';

@NgModule({
  declarations: [AdditionalComponent],
  imports: [
    CommonModule,
    TranslateSlugModule,
    HasKeysModule,
    HasStatusModule,
    ToLabelModule,
    FlexLayoutModule,
    MatDividerModule,
    MatChipsModule,
    RouterModule.forChild([{ path: '', component: AdditionalComponent }])
  ]
})
export class MovieAdditionalModule { }
