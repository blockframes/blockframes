
// Angular
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IfModule } from '@rx-angular/template/if';
import { ForModule } from '@rx-angular/template/for';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Blockframes
import { FileNameModule } from '@blockframes/utils/pipes';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { CardModalModule } from '@blockframes/ui/card-modal/card-modal.module';
import { GetOrgPipeModule } from '@blockframes/organization/pipes/get-org.pipe';
import { LogoSpinnerModule } from '@blockframes/ui/logo-spinner/logo-spinner.module';
import { FileUploaderModule } from '@blockframes/media/file/file-uploader/file-uploader.module';

// Pages
import { DocumentsComponent } from './documents.component';
import { ContractsFormModule } from '@blockframes/waterfall/components/contracts-form/contracts-form.module';

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
