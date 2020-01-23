import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MissingPipeModule } from '@blockframes/utils/pipes/missing.module';
import { MatChipsModule } from '@angular/material/chips';
import { MovieSummaryCreditComponent } from './credit.component';

@NgModule({
  declarations: [MovieSummaryCreditComponent],
  imports: [
    CommonModule,
    MissingPipeModule,
    MatChipsModule
  ],
  exports: [MovieSummaryCreditComponent]
})
export class MovieSummaryCreditModule { }
