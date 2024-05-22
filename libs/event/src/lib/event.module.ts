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

// Blockframes
import { LogoSpinnerModule } from '@blockframes/ui/logo-spinner/logo-spinner.module';
import { GlobalModalModule } from '@blockframes/ui/global-modal/global-modal.module';
import { ToLabelModule } from '@blockframes/utils/pipes';

// Forms
import { EventCreateComponent } from './form/create/create.component';
import { EditDetailsModule } from './form/edit-details/edit-details.module';

// Material
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog'
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacySlideToggleModule as MatSlideToggleModule } from '@angular/material/legacy-slide-toggle';

@NgModule({
  declarations: [
    CalendarWeekComponent,
    EventSizePipe,
    EventSmallDirective,
    EventLargeDirective,
    CalendarHeaderComponent,
    // Form
    EventCreateComponent,
  ],
  exports: [
    CalendarHeaderComponent,
    CalendarWeekComponent,
    EventSmallDirective,
    EventLargeDirective,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    EditDetailsModule,
    GlobalModalModule,
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory
    }),
    ToLabelModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatSelectModule,
    MatSlideToggleModule,
    LogoSpinnerModule,
  ]
})
export class EventModule {}