import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

// Component
import { TermFormComponent } from './form.component';

// Blockframes
import { LogoSpinnerModule } from '@blockframes/ui/logo-spinner/logo-spinner.module';
import { AvailsFilterModule } from '@blockframes/contract/avails/filter/filter.module';
import { LanguagesFormModule } from '@blockframes/movie/form/languages/languages.module';
import { JoinPipeModule, MaxLengthModule, ToGroupLabelPipeModule, ToLabelModule, VersionPipeModule } from '@blockframes/utils/pipes';
import { FormTableModule } from '@blockframes/ui/form/table/form-table.module';

// Material
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';

@NgModule({
  declarations: [
    TermFormComponent,
  ],
  imports: [
    CommonModule,
    ToLabelModule,
    FormTableModule,
    MaxLengthModule,
    JoinPipeModule,
    AvailsFilterModule,
    LanguagesFormModule,
    VersionPipeModule,
    ToGroupLabelPipeModule,
    LogoSpinnerModule,

    //Material
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatDialogModule,

    RouterModule.forChild([]),
  ],
  exports: [
    TermFormComponent
  ]
})
export class TermFormModule { }
