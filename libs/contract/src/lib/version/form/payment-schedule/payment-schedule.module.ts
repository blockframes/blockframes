import { PaymentScheduleComponent } from './payment-schedule.component';

// Angular
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Material
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';



@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    ReactiveFormsModule,

    // Material
    MatFormFieldModule,
    MatRadioModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatDividerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSlideToggleModule
  ],
  declarations: [PaymentScheduleComponent],
  exports: [PaymentScheduleComponent]
})
export class ContractVersionPaymentScheduleModule { }
