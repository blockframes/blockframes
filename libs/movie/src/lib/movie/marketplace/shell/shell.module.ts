// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

// Component
import { TitleMarketplaceShellComponent } from './shell.component';

// Custom Modules
import { AppBarModule } from '@blockframes/ui/app-bar';
import { MatLayoutModule } from '@blockframes/ui/layout/layout.module';
import { CarouselModule } from '@blockframes/ui/carousel/carousel.module';
import { OrgChipModule } from '@blockframes/organization/components/chip/chip.module';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { MovieHeaderModule } from '@blockframes/movie/components/header/header.module';
import { PromotionalLinksModule } from '@blockframes/movie/components/promotional-links/promotional-links.module';
import { WishlistButtonModule } from '@blockframes/organization/components/wishlist-button/wishlist-button.module';
import { HasKeysModule, ToLabelModule } from '@blockframes/utils/pipes';
import { DownloadPipeModule } from '@blockframes/media/file/pipes/download.pipe';
import { VideoViewerModule } from '@blockframes/media/video/viewer/viewer.module';
import { FileListPreviewModule } from '@blockframes/media/file/preview-list/preview-list.module';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { StorageFileModule } from '@blockframes/media/pipes/storageFile.pipe';

@NgModule({
  declarations: [TitleMarketplaceShellComponent],
  exports: [TitleMarketplaceShellComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ImageModule,
    MovieHeaderModule,
    OrgChipModule,
    WishlistButtonModule,
    PromotionalLinksModule,
    AppBarModule,
    CarouselModule,
    MatLayoutModule,
    HasKeysModule,
    DownloadPipeModule,
    VideoViewerModule,
    ToLabelModule,
    FileListPreviewModule,
    StorageFileModule,

    // Material
    MatChipsModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatTabsModule,
    MatCardModule,
    // Routes
    RouterModule
  ]
})
export class MovieShellModule { }
