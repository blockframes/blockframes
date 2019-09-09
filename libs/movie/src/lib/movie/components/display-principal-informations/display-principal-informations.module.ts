import { NgModule } from "@angular/core";
import { MovieDisplayPrincipalInformationsComponent } from "./display-principal-informations.component";
import { CommonModule } from "@angular/common";
import { FlexLayoutModule } from "@angular/flex-layout";

@NgModule({
  imports: [CommonModule, FlexLayoutModule],
  declarations: [MovieDisplayPrincipalInformationsComponent],
  exports: [MovieDisplayPrincipalInformationsComponent]
})

export class MovieDisplayPrincipalInformationsModule {}
