import { NgModule } from "@angular/core";
import { MovieDisplayAssetsComponent } from "./display-assets.component";
import { CommonModule } from "@angular/common";

@NgModule({
  imports: [CommonModule],
  declarations: [MovieDisplayAssetsComponent],
  exports: [MovieDisplayAssetsComponent]
})

export class MovieDisplayAssetsModule {}
