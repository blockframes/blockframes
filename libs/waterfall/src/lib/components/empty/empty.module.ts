// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Modules
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { LogoSpinnerModule } from '@blockframes/ui/logo-spinner/logo-spinner.module';
import { VersionEditorModule } from '../version/version-editor/version-editor.module';

// Pages
import { EmptyWaterfallComponent } from './empty.component';

// Material
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';

@NgModule({
  declarations: [EmptyWaterfallComponent],
  imports: [
    CommonModule,
    RouterModule,

    ImageModule,
    LogoSpinnerModule,
    VersionEditorModule,

    // Material
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
    MatDialogModule,
  ],
  exports: [EmptyWaterfallComponent]
})
export class EmptyWaterfallModule { }
