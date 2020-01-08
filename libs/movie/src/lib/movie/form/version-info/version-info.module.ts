import { MovieFormVersionInfoComponent } from './version-info.component';

// Angular
import { MatOptionModule } from '@angular/material/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

// Libraries
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

// Materials
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

@NgModule({
    declarations: [MovieFormVersionInfoComponent],
    imports: [
        // Angular
        CommonModule,
        ReactiveFormsModule,
        FlexLayoutModule,

        // Libraries
        NgxMatSelectSearchModule,

        // Materials
        MatFormFieldModule,
        MatSelectModule,
        MatOptionModule,
        MatButtonToggleModule,
        MatSlideToggleModule
    ],
    exports: [MovieFormVersionInfoComponent]
})
export class MovieFormVersionInfoModule { }
