import { NgModule } from "@angular/core";
import { MovieDisplayAvailabilitiesComponent } from "./display-availabilities.component";
import { CommonModule } from "@angular/common";
import {MatDividerModule} from '@angular/material/divider';

@NgModule({
  imports: [CommonModule, MatDividerModule],
  declarations: [MovieDisplayAvailabilitiesComponent],
  exports: [MovieDisplayAvailabilitiesComponent]
})

export class MovieDisplayAvailabilitiesModule {}
