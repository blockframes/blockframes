import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContractFormComponent } from './contract-form.component';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

// Material
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatLegacyButtonModule as MatButtonModule } from "@angular/material/legacy-button";
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';

// @blockframes
import { AvailsFilterModule } from '@blockframes/contract/avails/filter/filter.module';
import { FormTableModule } from "@blockframes/ui/form/table/form-table.module";
import { LanguagesFormModule } from "@blockframes/movie/form/languages/languages.module";
import { NegotiationFormModule } from '@blockframes/contract/negotiation'
// Pipes
import { ToLabelModule } from "@blockframes/utils/pipes/to-label.pipe";
import { VersionPipeModule } from "@blockframes/utils/pipes/version.pipe";
import { JoinPipeModule } from "@blockframes/utils/pipes/join.pipe";
import { ToGroupLabelPipeModule } from '@blockframes/utils/pipes/group-label.pipe';

@NgModule({
  declarations: [ContractFormComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([{ path: '', component: ContractFormComponent }]),
    ReactiveFormsModule,
    AvailsFilterModule,
    FormTableModule,
    ToLabelModule,
    VersionPipeModule,
    JoinPipeModule,
    LanguagesFormModule,
    ToGroupLabelPipeModule,
    MatProgressSpinnerModule,
    NegotiationFormModule,
    // Material
    MatSelectModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    FlexLayoutModule,
    MatButtonModule
  ]
})
export class ContractFormModule { }
