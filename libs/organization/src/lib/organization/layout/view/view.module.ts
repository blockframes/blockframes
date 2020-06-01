import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ImageReferenceModule } from '@blockframes/ui/media/image-reference/image-reference.module';
import { AppBarModule } from '@blockframes/ui/app-bar';
import { ToLabelModule, TranslateSlugModule } from '@blockframes/utils/pipes';
import { ViewComponent } from './view.component';

// Material
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';



@NgModule({
  declarations: [ViewComponent],
  exports: [ViewComponent],
  imports: [
    CommonModule,
    RouterModule,
    FlexLayoutModule,
    ImageReferenceModule,
    AppBarModule,
    ToLabelModule,
    TranslateSlugModule,
    // Material
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
  ]
})
export class OrganizationViewModule { }
