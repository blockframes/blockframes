import { NgModule } from "@angular/core";
import { MovieDisplayKeywordsComponent } from "./display-keywords.component";
import { CommonModule } from "@angular/common";
import { MatChipsModule } from '@angular/material/chips';

@NgModule({
  imports: [CommonModule, MatChipsModule],
  declarations: [MovieDisplayKeywordsComponent],
  exports: [MovieDisplayKeywordsComponent]
})

export class MovieDisplayKeywordsModule {}
