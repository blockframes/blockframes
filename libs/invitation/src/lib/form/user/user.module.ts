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

// Material
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

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
    // Material
    MatProgressBarModule,
    MatIconModule,
    MatButtonModule
  ]
})
export class InvitationFormUserModule { }
