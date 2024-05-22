import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NegotiationFormComponent } from './negotiation-form.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AvailsFilterModule } from '@blockframes/contract/avails/filter/filter.module';
import { LanguagesFormModule } from '@blockframes/movie/form/languages/languages.module';
import { ToLabelModule, VersionPipeModule, JoinPipeModule, ToGroupLabelPipeModule } from '@blockframes/utils/pipes';
import { FormTableModule } from '@blockframes/ui/form/table/form-table.module';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MaxLengthModule } from '@blockframes/utils/pipes';


@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AvailsFilterModule,
    FormTableModule,
    MatFormFieldModule,
    MatIconModule,
    ToLabelModule,
    VersionPipeModule,
    JoinPipeModule,
    LanguagesFormModule,
    ToGroupLabelPipeModule,
    MaxLengthModule,

    MatInputModule,
  ],
  exports: [NegotiationFormComponent],
  declarations: [NegotiationFormComponent]
})
export class NegotiationFormModule { }
