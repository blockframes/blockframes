import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';

import { TitleDashboardHeaderComponent, MovieHeaderActions } from './header.component';
import { ToLabelModule } from '@blockframes/utils/pipes/to-label.pipe';
import { TranslateSlugModule } from '@blockframes/utils/pipes/translate-slug.pipe';
import { DisplayNameModule } from '@blockframes/utils/pipes/display-name.pipe';
import { ImageReferenceModule } from '@blockframes/media/directives/image-reference/image-reference.module';

@NgModule({
  declarations: [TitleDashboardHeaderComponent, MovieHeaderActions],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ToLabelModule,
    TranslateSlugModule,
    DisplayNameModule,
    ImageReferenceModule,
  ],
  exports: [TitleDashboardHeaderComponent, MovieHeaderActions],
})

export class TitleDashboardHeaderModule {}
