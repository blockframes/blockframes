
// Angular
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

// Blockframes

// Pages
import { DocumentsComponent } from './documents.component';
import { ContractsFormModule } from '@blockframes/waterfall/components/contract/contracts-form/contracts-form.module';

@NgModule({
  declarations: [DocumentsComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    
    // Blockframes
    ContractsFormModule,

    // Material
    

    // Routing
    RouterModule.forChild([{ path: '', component: DocumentsComponent }]),
  ],
})
export class DocumentsModule { }
