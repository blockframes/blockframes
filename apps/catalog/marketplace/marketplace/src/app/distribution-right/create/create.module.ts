import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MonthCalendarModule } from '@blockframes/ui/month-calendar/month-calendar.module';
import { DatepickerModule } from '@blockframes/ui/datepicker/datepicker.module';
import { DistributionRightCreateComponent } from './create.component';

// Material
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBarModule } from '@angular/material/snack-bar';


@NgModule({
  declarations: [DistributionRightCreateComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DatepickerModule,
    MonthCalendarModule,
    FlexLayoutModule,

    // Material
    MatInputModule,
    MatButtonModule,
    MatAutocompleteModule,
    MatExpansionModule,
    MatCardModule,
    MatSortModule,
    MatChipsModule,
    MatTableModule,
    MatFormFieldModule,
    MatListModule,
    MatCheckboxModule,
    MatIconModule,
    MatSnackBarModule,

    RouterModule.forChild([{ path: '', component: DistributionRightCreateComponent }])
  ]
})
export class DistributionRightCreateModule {}
