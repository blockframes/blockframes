import { NgModule } from "@angular/core";
import { MovieDisplayPrizesComponent } from "./display-prizes.component";
import { CommonModule } from "@angular/common";
import { FlexLayoutModule } from "@angular/flex-layout";

@NgModule({
  imports: [CommonModule, FlexLayoutModule],
  declarations: [MovieDisplayPrizesComponent],
  exports: [MovieDisplayPrizesComponent]
})

export class MovieDisplayPrizesModule {}
