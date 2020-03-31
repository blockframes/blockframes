import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';

// Components
import { CalendarHeaderComponent } from './components/header/header.component';
import { CalendarWeekComponent } from './components/week/week.component';
import { EventSmallDirective, EventLargeDirective } from './components/event.directive';
import { EventSizePipe } from './components/event.pipe';
// Forms
import { EventCreateComponent } from './form/create/create.component';
import { EventFormComponent } from './form/base/base.component';
import { TimeDateModule } from './form/time-date.directive';
import { TimePickerModule } from '@blockframes/ui/form/time-picker/time-picker.module';

// Material
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog'
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';


@NgModule({
  declarations: [
    CalendarWeekComponent,
    EventSizePipe,
    EventSmallDirective,
    EventLargeDirective,
    CalendarHeaderComponent,
    // Form
    EventCreateComponent,
    EventFormComponent,
  ],
  exports: [
    CalendarHeaderComponent,
    CalendarWeekComponent,
    EventSmallDirective,
    EventLargeDirective,
    EventFormComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    TimeDateModule,
    TimePickerModule,
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory
    }),
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
  ]
})
export class EventModule {}