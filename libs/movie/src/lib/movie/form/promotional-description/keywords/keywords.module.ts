import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule, } from '@angular/material/chips';
import { KeywordsComponent } from './keywords.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatChipsModule,
        MatIconModule,
        MatInputModule
    ],
    declarations: [KeywordsComponent],
    exports: [KeywordsComponent]
})
export class MovieFormKeywordsComponent { }