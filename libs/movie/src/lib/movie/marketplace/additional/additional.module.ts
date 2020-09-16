import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdditionalComponent } from './additional.component';
import { TranslateSlugModule } from '@blockframes/utils/pipes/translate-slug.pipe';

// Material
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({
  declarations: [AdditionalComponent],
  imports: [
    CommonModule,
    TranslateSlugModule,
    // Material
    MatProgressSpinnerModule,
    MatCardModule,
    RouterModule.forChild([{ path: '', component: AdditionalComponent }])
  ]
})
export class MovieAdditionalModule { }
