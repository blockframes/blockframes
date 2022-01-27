import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { EventFormShellComponent } from './shell.component';
import { EditDetailsModule } from '../../form/edit-details/edit-details.module';
import { AppBarModule } from '@blockframes/ui/app-bar';
import { AgendaExportModule } from '@blockframes/event/components/agenda-export/agenda-export.module';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialogModule } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({
  declarations: [EventFormShellComponent],
  exports: [EventFormShellComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    RouterModule,
    EditDetailsModule,
    AppBarModule,
    AgendaExportModule,

    // Material
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatTabsModule,
    MatDialogModule,
    MatChipsModule,
    MatProgressSpinnerModule
  ]
})
export class EventFromShellModule { }
