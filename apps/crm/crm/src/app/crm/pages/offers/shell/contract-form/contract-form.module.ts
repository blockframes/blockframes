import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContractFormComponent } from './contract-form.component';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

// Material
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from "@angular/material/button";
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// @blockframes
import { AvailsFilterModule } from '@blockframes/contract/avails/filter/filter.module';
import { FormTableModule } from "@blockframes/ui/form/table/form-table.module";
import { TableFilterModule } from "@blockframes/ui/list/table-filter/table-filter.module";
import { LanguagesFormModule } from "@blockframes/movie/form/languages/languages.module";

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
    TableFilterModule,
    ToLabelModule,
    VersionPipeModule,
    JoinPipeModule,
    LanguagesFormModule,
    ToGroupLabelPipeModule,
    MatProgressSpinnerModule,
    
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
