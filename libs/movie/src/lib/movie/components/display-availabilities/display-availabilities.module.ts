import { NgModule } from "@angular/core";
import { MovieDisplayAvailabilitiesComponent } from "./header.component";
import { CommonModule } from "@angular/common";

@NgModule({
  imports: [CommonModule]
  declarations: [MovieDisplayAvailabilitiesComponent],
  exports: [MovieDisplayAvailabilitiesComponent]
})

export class MovieDisplayAvailabilitiesModule {}
