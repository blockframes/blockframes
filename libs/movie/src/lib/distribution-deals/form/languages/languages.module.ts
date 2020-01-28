import { MatIconModule } from '@angular/material/icon';
import { TranslateSlugModule } from '@blockframes/utils';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DistributionDealLanguagesComponent } from './languages.component';
import { FormLanguageModule } from '@blockframes/ui/form/language/language.module';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    TranslateSlugModule,

    // Forms
    FormLanguageModule,

    // Material
    MatButtonToggleModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatIconModule
  ],
  declarations: [DistributionDealLanguagesComponent],
  exports: [DistributionDealLanguagesComponent]
})
export class DistributionDealLanguagesModule {}
