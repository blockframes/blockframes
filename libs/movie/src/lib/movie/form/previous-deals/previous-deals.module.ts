import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { CommonModule } from '@angular/common';
import { MovieFormPreviousDealsComponent } from './previous-deals.component';
import { NgModule } from '@angular/core';

@NgModule({
    declarations: [MovieFormPreviousDealsComponent],
    imports: [CommonModule, FlexLayoutModule, ReactiveFormsModule,
    
    // Material
    MatFormFieldModule
    ],
    exports: [MovieFormPreviousDealsComponent]
})
export class MoviePreviousDealsModule {}