import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { UserComponent } from './user.component';

// Blockframes
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { DisplayNameModule } from '@blockframes/utils/pipes';
import { AlgoliaChipsAutocompleteModule } from '@blockframes/ui/algolia/chips-autocomplete/algolia-chips-autocomplete.module';
import { DeepKeyPipeModule } from '@blockframes/utils/pipes';
import { DisplayUserModule } from '@blockframes/utils/pipes/display-user.pipe';
import { StorageFileModule } from '@blockframes/media/pipes/storageFile.pipe';
import { EventFromShellModule } from '@blockframes/event/form/shell/shell.module';

// Material
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [UserComponent],
  exports: [UserComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    // Blockframes
    ImageModule,
    AlgoliaChipsAutocompleteModule,
    DisplayNameModule,
    DeepKeyPipeModule,
    DisplayUserModule,
    StorageFileModule,
    EventFromShellModule,
    // Material
    MatProgressBarModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule
  ]
})
export class InvitationFormUserModule { }
