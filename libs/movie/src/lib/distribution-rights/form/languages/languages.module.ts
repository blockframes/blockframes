// Angular
import { TranslateSlugModule } from '@blockframes/utils/pipes/translate-slug.pipe';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Custom
import { DistributionRightLanguagesComponent } from './languages.component';
import { FormLanguageModule } from '@blockframes/ui/form/language/language.module';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
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
    MatIconModule,
    MatTooltipModule
  ],
  declarations: [DistributionRightLanguagesComponent],
  exports: [DistributionRightLanguagesComponent]
})
export class DistributionRightLanguagesModule {}
