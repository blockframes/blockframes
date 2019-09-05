import { NgModule } from "@angular/core";
import { MovieDisplayVersionInfoComponent } from "./header.component";
import { CommonModule } from "@angular/common";

@NgModule({
  imports: [CommonModule]
  declarations: [MovieDisplayVersionInfoComponent],
  exports: [MovieDisplayVersionInfoComponent]
})

export class MovieDisplayVersionInfoModule {}
