import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MissingControlComponent } from './missing-control.component';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { TranslateSlugModule } from '@blockframes/utils/pipes/translate-slug.module';
import { TranslateObjectModule } from '@blockframes/utils/pipes/translate-object.module';

@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    TranslateSlugModule,
    RouterModule,
    TranslateObjectModule,
  ],
  declarations: [MissingControlComponent],
  exports: [MissingControlComponent]
})
export class MissingControlModule {}
