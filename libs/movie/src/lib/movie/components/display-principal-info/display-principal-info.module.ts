import { NgModule } from "@angular/core";
import { MovieDisplayPrincipalInfoComponent } from "./display-principal-info.component";
import { CommonModule } from "@angular/common";
import { FlexLayoutModule } from "@angular/flex-layout";

@NgModule({
  imports: [CommonModule, FlexLayoutModule],
  declarations: [MovieDisplayPrincipalInfoComponent],
  exports: [MovieDisplayPrincipalInfoComponent]
})

export class MovieDisplayPrincipalInfoModule {}
