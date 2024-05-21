import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

// Component
import { EventFormShellComponent } from './shell.component';
import { EditDetailsModule } from '../../form/edit-details/edit-details.module';

// Blockframes
import { AppBarModule } from '@blockframes/ui/app-bar';
import { AgendaExportModule } from '@blockframes/event/components/agenda-export/agenda-export.module';
import { GlobalModalModule } from '@blockframes/ui/global-modal/global-modal.module';
import { SnackbarErrorModule } from '@blockframes/ui/snackbar/error/snackbar-error.module';
import { ExplanationModule } from '../../components/explanation/explanation.module';
import { LogoSpinnerModule } from '@blockframes/ui/logo-spinner/logo-spinner.module';

// Material
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatLegacyChipsModule as MatChipsModule } from '@angular/material/legacy-chips';

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
    SnackbarErrorModule,
    GlobalModalModule,
    ExplanationModule,
    LogoSpinnerModule,
    
    // Material
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatTabsModule,
    MatDialogModule,
    MatChipsModule
  ]
})
export class EventFromShellModule { }
