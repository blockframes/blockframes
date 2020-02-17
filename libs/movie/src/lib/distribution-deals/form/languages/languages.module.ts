// Angular
import { TranslateSlugModule } from '@blockframes/utils';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Custom
import { DistributionDealLanguagesComponent } from './languages.component';
import { FormLanguageModule } from '@blockframes/ui/form/language/language.module';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    TranslateSlugModule,

    // Forms
    FormLanguageModule,

    // Material
    MatCheckboxModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatIconModule
  ],
  declarations: [DistributionDealLanguagesComponent],
  exports: [DistributionDealLanguagesComponent]
})
export class DistributionDealLanguagesModule {}
