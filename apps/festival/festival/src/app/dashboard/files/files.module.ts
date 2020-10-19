// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Blockframes
import { FileExplorerModule } from '@blockframes/media/components/file-explorer/file-explorer.module';

import { FilesViewComponent } from './files.component';


@NgModule({
  declarations: [FilesViewComponent],
  imports: [
    CommonModule,

    // Blockframes
    FileExplorerModule,

    // Routing
    RouterModule.forChild([{ path: '', component: FilesViewComponent }])
  ],
})
export class FilesViewModule { }
