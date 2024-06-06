// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

// Blockframes UI
import { TunnelPageModule } from '@blockframes/ui/tunnel';
import { MissingControlModule } from '@blockframes/ui/missing-control/missing-control.module';
import { OpenPreviewModule } from '@blockframes/ui/open-preview/open-preview.module';

// Blockframes Utils
import { MaxLengthModule, ToLabelModule } from '@blockframes/utils/pipes';
import { FileNameModule } from '@blockframes/utils/pipes/fileName.pipe';
import { VersionPipeModule } from '@blockframes/utils/pipes/version.pipe';
import { HasStatusModule } from '../../pipes/has-status.pipe';
import { JoinPipeModule } from '@blockframes/utils/pipes/join.pipe';

// Blockframes Movie
import { FilmographyPipeModule } from '../../pipes/filmography.pipe';
import { RunningTimePipeModule } from '../../pipes/running-time.pipe';

// Summary Components
import { SummaryMainComponent } from './main/main.component';
import { SummarySynopsisComponent } from './synopsis/synopsis.component';
import { SummaryProductionComponent } from './production/production.component';
import { SummaryArtisticComponent } from './artistic/artistic.component';
import { SummaryReviewComponent } from './review/review.component';
import { SummaryAdditionalInformationComponent } from './additional-information/additional-information.component';
import { SummaryTechnicalInfoComponent } from './technical-info/technical-info.component';
import { SummaryAvailableVersionsComponent } from './available-versions/available-versions.component';
import { SummaryAvailableMaterialsComponent } from './available-materials/available-materials.component';
import { SummaryMediaFilesComponent } from './media-files/media-files.component';
import { SummaryMediaImagesComponent } from './media-images/media-images.component';
import { SummaryMediaVideosComponent } from './media-videos/media-videos.component';
import { SummaryMediaScreenerComponent } from './media-screener/media-screener.component';
import { SummaryMediaNotesComponent } from './media-notes/notes.component';
import { SummaryShootingInformationComponent } from './shooting-information/shooting-information.component';
import { DownloadPipeModule } from '@blockframes/media/file/pipes/download.pipe';
import { StorageFileModule } from '@blockframes/media/pipes/storageFile.pipe';

@NgModule({
  declarations: [
    SummaryMainComponent,
    SummarySynopsisComponent,
    SummaryProductionComponent,
    SummaryArtisticComponent,
    SummaryReviewComponent,
    SummaryAdditionalInformationComponent,
    SummaryTechnicalInfoComponent,
    SummaryAvailableVersionsComponent,
    SummaryAvailableMaterialsComponent,
    SummaryMediaFilesComponent,
    SummaryMediaImagesComponent,
    SummaryMediaVideosComponent,
    SummaryMediaScreenerComponent,
    SummaryMediaNotesComponent,
    SummaryShootingInformationComponent
  ],
  imports: [
    CommonModule,
    FlexLayoutModule,
    TunnelPageModule,
    DownloadPipeModule,
    StorageFileModule,

    MissingControlModule,
    ToLabelModule,
    VersionPipeModule,
    RunningTimePipeModule,
    FileNameModule,
    FlexLayoutModule,
    HasStatusModule,
    MaxLengthModule,
    FilmographyPipeModule,
    OpenPreviewModule,
    JoinPipeModule,

    // Materials
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    MatDividerModule,
    MatTooltipModule,

    RouterModule.forChild([])
  ],
  exports: [
    SummaryMainComponent,
    SummarySynopsisComponent,
    SummaryProductionComponent,
    SummaryArtisticComponent,
    SummaryReviewComponent,
    SummaryAdditionalInformationComponent,
    SummaryTechnicalInfoComponent,
    SummaryAvailableVersionsComponent,
    SummaryAvailableMaterialsComponent,
    SummaryMediaFilesComponent,
    SummaryMediaImagesComponent,
    SummaryMediaVideosComponent,
    SummaryMediaScreenerComponent,
    SummaryMediaNotesComponent,
    SummaryShootingInformationComponent
  ]
})
export class MovieTunnelSummaryModule { }
