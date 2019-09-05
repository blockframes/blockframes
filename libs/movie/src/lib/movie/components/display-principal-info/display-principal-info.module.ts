import { NgModule } from "@angular/core";
import { MovieDisplayPrincipalInfoComponent } from "./header.component";
import { CommonModule } from "@angular/common";

@NgModule({
  imports: [CommonModule]
  declarations: [MovieDisplayPrincipalInfoComponent],
  exports: [MovieDisplayPrincipalInfoComponent]
})

export class MovieDisplayPrincipalInfoModule {}
