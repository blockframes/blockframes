import { NgModule } from "@angular/core";
import { MovieDisplayProductionComponent } from "./display-production.component";
import { CommonModule } from "@angular/common";
import { FlexLayoutModule } from "@angular/flex-layout";

@NgModule({
  imports: [CommonModule, FlexLayoutModule],
  declarations: [MovieDisplayProductionComponent],
  exports: [MovieDisplayProductionComponent]
})

export class MovieDisplayProductionModule {}
