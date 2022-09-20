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
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';

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
