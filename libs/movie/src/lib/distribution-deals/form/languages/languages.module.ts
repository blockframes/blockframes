import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DistributionDealLanguagesComponent } from './languages.component';
import { MatButtonToggleGroup } from '@angular/material';
import { FormLanguageModule } from '@blockframes/ui/form/language/language.module';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FlexLayoutModule,

    // Form Modules
  /*   FormLanguageModule, */

    // Material
    MatButtonToggleGroup
  ],
  declarations: [DistributionDealLanguagesComponent],
  exports: [DistributionDealLanguagesComponent]
})
export class DistributionDealLanguagesModule { }
