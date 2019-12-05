import { NgModule } from "@angular/core";
import { MovieDisplayPrizesComponent } from "./display-prizes.component";
import { CommonModule } from "@angular/common";
import { FlexLayoutModule } from "@angular/flex-layout";
import { ImageReferenceModule } from '@blockframes/ui/image-reference/image-reference.module';

@NgModule({
  imports: [CommonModule, FlexLayoutModule, ImageReferenceModule],
  declarations: [MovieDisplayPrizesComponent],
  exports: [MovieDisplayPrizesComponent]
})

export class MovieDisplayPrizesModule { }
