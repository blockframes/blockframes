import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ArtisticComponent, NoteNamePipe } from './artistic.component';

import { CreditCardModule } from '../../components/credit-card/credit-card.module';
import { MatLayoutModule } from '@blockframes/ui/layout/layout.module';
import { HasKeysModule, DisplayNameModule, FileNameModule } from '@blockframes/utils/pipes';
import { DownloadModule } from '@blockframes/media/pipes/download.pipe';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [ArtisticComponent, NoteNamePipe],
  imports: [
    CommonModule,
    FlexLayoutModule,
    FileNameModule,
    DisplayNameModule,
    DownloadModule,
    CreditCardModule,
    MatLayoutModule,
    HasKeysModule,
    MatDividerModule,
    MatIconModule,
    RouterModule.forChild([{ path: '', component: ArtisticComponent }])
  ]
})
export class MovieArtisticModule { }
