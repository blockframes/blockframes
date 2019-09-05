import { NgModule } from "@angular/core";
import { MovieDisplayFilmDetailsComponent } from "./header.component";
import { CommonModule } from "@angular/common";

@NgModule({
  imports: [CommonModule]
  declarations: [MovieDisplayFilmDetailsComponent],
  exports: [MovieDisplayFilmDetailsComponent]
})

export class MovieDisplayFilmDetailsModule {}
