import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { UserComponent } from './user.component';
import { ImgModule } from '@blockframes/ui/media/img/img.module';
import { DisplayNameModule } from '@blockframes/utils/pipes';
import { AlgoliaChipsAutocompleteModule } from '@blockframes/ui/algolia/chips-autocomplete/algolia-chips-autocomplete.module';

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
    ImgModule,
    AlgoliaChipsAutocompleteModule,
    DisplayNameModule,
    MatProgressBarModule,
    MatIconModule,
    MatButtonModule
  ]
})
export class InvitationFormUserModule { }
