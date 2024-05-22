import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreditCardComponent, StatusIconPipe, EmptyImgPipe, HasFilmographyPipe } from './credit-card.component';

import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { DisplayNameModule, MaxLengthModule, ToLabelModule } from '@blockframes/utils/pipes';
import { FilmographyPipeModule } from '../../pipes/filmography.pipe';
import { FlexLayoutModule } from '@angular/flex-layout';

import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';



@NgModule({
  declarations: [CreditCardComponent, StatusIconPipe, EmptyImgPipe, HasFilmographyPipe],
  exports: [CreditCardComponent],
  imports: [
    CommonModule,
    ImageModule,
    FilmographyPipeModule,
    DisplayNameModule,
    MaxLengthModule,
    ToLabelModule,
    FlexLayoutModule,
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatDividerModule,
    MatTooltipModule
  ]
})
export class CreditCardModule { }
