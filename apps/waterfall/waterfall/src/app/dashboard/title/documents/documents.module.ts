
// Angular
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

// Blockframes
import { ContractListModule } from '@blockframes/waterfall/components/contract-list/contract-list.module';
import { LogoSpinnerModule } from '@blockframes/ui/logo-spinner/logo-spinner.module';

// Pages
import { DocumentsComponent } from './documents.component';

@NgModule({
  declarations: [DocumentsComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,

    // Blockframes
    ContractListModule,
    LogoSpinnerModule,

    // Material


    // Routing
    RouterModule.forChild([{ path: '', component: DocumentsComponent }]),
  ],
})
export class DocumentsModule { }
