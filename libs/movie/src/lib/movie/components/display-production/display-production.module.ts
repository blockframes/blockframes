import { NgModule } from "@angular/core";
import { MovieDisplayProductionComponent } from "./display-production.component";
import { CommonModule } from "@angular/common";

@NgModule({
  imports: [CommonModule],
  declarations: [MovieDisplayProductionComponent],
  exports: [MovieDisplayProductionComponent]
})

export class MovieDisplayProductionModule {}
