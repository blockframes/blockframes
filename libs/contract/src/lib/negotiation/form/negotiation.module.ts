import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NegotiationFormComponent } from './negotiation-form.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AvailsFilterModule } from '../../avails/filter/filter.module';
import { LanguagesFormModule } from '@blockframes/movie/form/languages/languages.module';
import { ToLabelModule, VersionPipeModule, JoinPipeModule, ToGroupLabelPipeModule } from '@blockframes/utils/pipes';
import { FormTableModule } from '@blockframes/ui/form/table/form-table.module';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
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
