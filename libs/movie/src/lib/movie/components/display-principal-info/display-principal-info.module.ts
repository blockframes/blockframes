import { NgModule } from "@angular/core";
import { MovieDisplayPrincipalInfoComponent } from "./display-principal-info.component";
import { CommonModule } from "@angular/common";

@NgModule({
  imports: [CommonModule],
  declarations: [MovieDisplayPrincipalInfoComponent],
  exports: [MovieDisplayPrincipalInfoComponent]
})

export class MovieDisplayPrincipalInfoModule {}
