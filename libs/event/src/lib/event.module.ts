import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';

// Components
import { CalendarWeekEventComponent } from './components/week-event/week-event.component';
import { CalendarWeekComponent } from './components/week/week.component';
import { EventSizePipe } from './components/week-event/event-size.pipe';
import { CalendarComponent } from './components/calendar/calendar.component';
// Forms
import { EventCreateComponent } from './form/create/create.component';
import { EventEditComponent } from './form/edit/edit.component';
import { TimeDateValueAccessor } from './time-date';

// Material
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatDialogModule } from '@angular/material/dialog'
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';


@NgModule({
  declarations: [
    CalendarWeekComponent,
    EventSizePipe,
    CalendarWeekEventComponent,
    EventCreateComponent,
    EventEditComponent,
    TimeDateValueAccessor,
    CalendarComponent,
  ],
  exports: [CalendarComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory
    }),
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatBottomSheetModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
  ]
})
export class EventModule {}