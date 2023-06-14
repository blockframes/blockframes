
// Angular
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

// Blockframes

// Pages
import { DocumentsComponent } from './documents.component';

@NgModule({
  declarations: [DocumentsComponent],
  imports: [
    CommonModule,

    // Blockframes

    // Material

    // Routing
    RouterModule.forChild([{ path: '', component: DocumentsComponent }]),
  ],
})
export class DocumentsModule { }
