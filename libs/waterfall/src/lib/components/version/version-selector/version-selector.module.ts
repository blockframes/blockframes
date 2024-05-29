// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { VersionSelectorComponent } from './version-selector.component';

// Blockframes
import { VersionEditorModule } from '../version-editor/version-editor.module';

// Material
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyRadioModule as MatRadioModule } from '@angular/material/legacy-radio';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';

@NgModule({
  declarations: [VersionSelectorComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    VersionEditorModule,

    MatSnackBarModule,
    MatButtonModule,
    MatMenuModule,
    MatTooltipModule,
    MatIconModule,
    MatRadioModule,
    MatDialogModule,
  ],
  exports: [VersionSelectorComponent]
})
export class VersionSelectorModule { }
