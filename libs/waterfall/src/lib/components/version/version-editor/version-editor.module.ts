import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { VersionEditorComponent } from './version-editor.component';

// Blockframes
import { GlobalModalModule } from '@blockframes/ui/global-modal/global-modal.module';
import { RightholderSelectModule } from '../../rightholder/rightholder-select/rightholder-select.module';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRadioModule } from '@angular/material/radio';

@NgModule({
  declarations: [VersionEditorComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,

    GlobalModalModule,
    RightholderSelectModule,

    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    MatRadioModule,

    RouterModule,
  ],
  exports: [VersionEditorComponent]
})
export class VersionEditorModule { }
