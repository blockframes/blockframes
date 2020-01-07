import { NgModule } from "@angular/core";
import { MovieDisplaySynopsisComponent } from "./display-synopsis.component";
import { CommonModule } from "@angular/common";

@NgModule({
  imports: [CommonModule],
  declarations: [MovieDisplaySynopsisComponent],
  exports: [MovieDisplaySynopsisComponent]
})

export class MovieDisplaySynopsisModule {}
