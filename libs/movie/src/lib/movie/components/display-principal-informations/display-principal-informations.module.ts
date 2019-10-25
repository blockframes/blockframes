import { NgModule } from "@angular/core";
import { MovieDisplayPrincipalInformationsComponent } from "./display-principal-informations.component";
import { CommonModule } from "@angular/common";
import { FlexLayoutModule } from "@angular/flex-layout";
import { TranslateSlugPipe } from '@blockframes/utils/pipes/translate-slug.pipe';

@NgModule({
  imports: [CommonModule, FlexLayoutModule],
  declarations: [MovieDisplayPrincipalInformationsComponent, TranslateSlugPipe],
  exports: [MovieDisplayPrincipalInformationsComponent]
})

export class MovieDisplayPrincipalInformationsModule {}
