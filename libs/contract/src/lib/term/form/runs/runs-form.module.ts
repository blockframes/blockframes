import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common'
import { ReactiveFormsModule } from '@angular/forms';

// Material
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

//Blockframes
import { StaticGroupModule } from '@blockframes/ui/static-autocomplete/group/group.module';
import { RunsFormComponent } from "@blockframes/contract/term/form/runs/runs-form.component";

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    MatDividerModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatInputModule,
    StaticGroupModule,
    MatIconModule
  ],
  declarations: [RunsFormComponent],
  exports: [RunsFormComponent]
})
export class RunsFormModule { }
