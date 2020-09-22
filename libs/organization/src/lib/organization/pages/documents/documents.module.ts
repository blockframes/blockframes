import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Components
import { DocumentsComponent } from './documents.component';

// Modules
import { OrganizationFilesModule } from '@blockframes/organization/components/files/files.module';

@NgModule({
  declarations: [
    DocumentsComponent,
  ],
  imports: [
    CommonModule,
    OrganizationFilesModule,
    RouterModule.forChild([{ path: '', component: DocumentsComponent }])
  ]
})
export class DocumentsModule { }
