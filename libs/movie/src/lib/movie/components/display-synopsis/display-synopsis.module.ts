import { NgModule } from "@angular/core";
import { MovieDisplaySynopsisComponent } from "./header.component";
import { CommonModule } from "@angular/common";

@NgModule({
  imports: [CommonModule]
  declarations: [MovieDisplaySynopsisComponent],
  exports: [MovieDisplaySynopsisComponent]
})

export class MovieDisplaySynopsisModule {}
