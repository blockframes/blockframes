// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { VersionSelectorComponent } from './version-selector.component';

// Blockframes
import { VersionEditorModule } from '../version-editor/version-editor.module';

// Material
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatDialogModule } from '@angular/material/dialog';

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
