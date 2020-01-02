import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

// Components
import { KeywordsComponent } from './keywords/keywords.component';
import { KeyAssetsComponent } from './key-assets/key-assets.component';

// Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';


@NgModule({
  declarations: [KeywordsComponent, KeyAssetsComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  exports: [KeywordsComponent, KeyAssetsComponent]
})
export class MovieFormPromotionalDescriptionModule { }
