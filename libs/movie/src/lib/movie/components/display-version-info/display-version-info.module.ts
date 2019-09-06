import { NgModule } from "@angular/core";
import { MovieDisplayVersionInfoComponent } from "./display-version-info.component";
import { CommonModule } from "@angular/common";

@NgModule({
  imports: [CommonModule],
  declarations: [MovieDisplayVersionInfoComponent],
  exports: [MovieDisplayVersionInfoComponent]
})

export class MovieDisplayVersionInfoModule {}
