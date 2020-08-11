import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ImageReferenceModule } from '@blockframes/media/directives/image-reference/image-reference.module';
import { TranslateSlugModule } from '@blockframes/utils/pipes/translate-slug.module';
import { ToLabelModule } from '@blockframes/utils/pipes';
import { DisplayNameModule } from '@blockframes/utils/pipes';
import { MainComponent } from './main.component';

// Material
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';


@NgModule({
  declarations: [MainComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    TranslateSlugModule,
    DisplayNameModule,
    ToLabelModule,
    ImageReferenceModule,
    // Material
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    RouterModule.forChild([{ path: '', component: MainComponent }])
  ]
})
export class MovieMainModule { }
