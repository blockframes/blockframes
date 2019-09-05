import { NgModule } from "@angular/core";
import { MovieDisplayKeywordsComponent } from "./header.component";
import { CommonModule } from "@angular/common";

@NgModule({
  imports: [CommonModule]
  declarations: [MovieDisplayKeywordsComponent],
  exports: [MovieDisplayKeywordsComponent]
})

export class MovieDisplayKeywordsModule {}
