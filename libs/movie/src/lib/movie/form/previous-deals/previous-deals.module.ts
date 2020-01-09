import { FlexLayoutModule } from '@angular/flex-layout';
import { CommonModule } from '@angular/common';
import { MovieFormPreviousSales } from './previous-deals.component';
import { NgModule } from '@angular/core';

@NgModule({
    declarations: [MovieFormPreviousDeals],
    imports: [CommonModule, FlexLayoutModule],
    exports: [MovieFormPreviousDeals]
})
export class MoviePreviousDealsModule {}