import { NgModule } from "@angular/core";
import { MovieDisplayAvailabilitiesComponent } from "./display-availabilities.component";
import { CommonModule } from "@angular/common";
import {MatDividerModule} from '@angular/material/divider';
import { FlexLayoutModule } from "@angular/flex-layout";

@NgModule({
  imports: [CommonModule, MatDividerModule, FlexLayoutModule],
  declarations: [MovieDisplayAvailabilitiesComponent],
  exports: [MovieDisplayAvailabilitiesComponent]
})

export class MovieDisplayAvailabilitiesModule {}
