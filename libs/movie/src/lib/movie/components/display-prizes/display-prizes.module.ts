import { NgModule } from "@angular/core";
import { MovieDisplayPrizesComponent } from "./display-prizes.component";
import { CommonModule } from "@angular/common";
import { FlexLayoutModule } from "@angular/flex-layout";
import { CropperModule } from "@blockframes/ui/cropper/cropper.module";

@NgModule({
  imports: [CommonModule, FlexLayoutModule, CropperModule],
  declarations: [MovieDisplayPrizesComponent],
  exports: [MovieDisplayPrizesComponent]
})

export class MovieDisplayPrizesModule { }
