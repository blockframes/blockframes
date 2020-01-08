import { NgModule } from '@angular/core';
import { MovieDisplayPrincipalInformationsComponent } from './display-principal-informations.component';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { TranslateSlugModule } from '@blockframes/utils/pipes/translate-slug.module';

@NgModule({
  imports: [CommonModule, FlexLayoutModule, TranslateSlugModule],
  declarations: [MovieDisplayPrincipalInformationsComponent],
  exports: [MovieDisplayPrincipalInformationsComponent]
})
export class MovieDisplayPrincipalInformationsModule {}
