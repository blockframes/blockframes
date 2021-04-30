import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common'
import { AvailsTitleFilterComponent } from './avails-title-filter.component';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { StaticGroupModule } from '@blockframes/ui/static-autocomplete/group/group.module';

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
  ],
  exports: [AvailsTitleFilterComponent],
  declarations: [AvailsTitleFilterComponent],
})
export class AvailsTitleFilterModule { }
