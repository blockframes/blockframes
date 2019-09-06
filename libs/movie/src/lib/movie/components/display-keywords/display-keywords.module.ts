import { NgModule } from "@angular/core";
import { MovieDisplayKeywordsComponent } from "./display-keywords.component";
import { CommonModule } from "@angular/common";
import { MatChipsModule } from '@angular/material/chips';
import { FlexLayoutModule } from "@angular/flex-layout";

@NgModule({
  imports: [CommonModule, MatChipsModule, FlexLayoutModule],
  declarations: [MovieDisplayKeywordsComponent],
  exports: [MovieDisplayKeywordsComponent]
})

export class MovieDisplayKeywordsModule {}
