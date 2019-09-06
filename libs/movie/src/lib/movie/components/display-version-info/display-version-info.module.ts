import { NgModule } from "@angular/core";
import { MovieDisplayVersionInfoComponent } from "./display-version-info.component";
import { CommonModule } from "@angular/common";
import { FlexLayoutModule } from "@angular/flex-layout";

@NgModule({
  imports: [CommonModule, FlexLayoutModule],
  declarations: [MovieDisplayVersionInfoComponent],
  exports: [MovieDisplayVersionInfoComponent]
})

export class MovieDisplayVersionInfoModule {}
