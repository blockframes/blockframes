// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Components
import { ContractViewComponent } from './view.component';

// Blockframes
import { LogoSpinnerModule } from '@blockframes/ui/logo-spinner/logo-spinner.module';
import { FileNameModule } from '@blockframes/utils/pipes';
import { ContractMainInfoModule } from '@blockframes/waterfall/components/document/contract/contract-main-info/contract-main-info.module';
import { PdfViewerModule } from '@blockframes/media/pdf/viewer/viewer.module';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { DownloadPipeModule } from '@blockframes/media/file/pipes/download.pipe';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [ContractViewComponent],
  imports: [
    CommonModule,

    // Blockframes
    LogoSpinnerModule,
    ContractMainInfoModule,
    PdfViewerModule,
    FileNameModule,
    ImageModule,
    DownloadPipeModule,

    // Material
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,

    // Routing
    RouterModule.forChild([{ path: '', component: ContractViewComponent }]),
  ],
})
export class ContractViewModule { }
