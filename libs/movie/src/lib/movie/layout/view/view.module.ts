import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ViewComponent, MovieHeader } from './view.component';
import { ImageReferenceModule } from '@blockframes/media/directives/image-reference/image-reference.module';
import { DisplayNameModule, TranslateSlugModule } from '@blockframes/utils/pipes';
import { AppBarModule } from '@blockframes/ui/app-bar';

// Material
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';



@NgModule({
  declarations: [ViewComponent, MovieHeader],
  exports: [ViewComponent, MovieHeader],
  
  imports: [
    CommonModule,
    RouterModule,
    FlexLayoutModule,
    ImageReferenceModule,
    DisplayNameModule,
    TranslateSlugModule,
    AppBarModule,
    // Material
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
  ]
})
export class MovieViewLayoutModule { }
