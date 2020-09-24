// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

// Components
import { MovieFormFinancialDetailsComponent, BudgetPipe } from './financial-details.component';
import { TunnelPageModule } from '@blockframes/ui/tunnel';
import { StaticSelectModule } from '@blockframes/ui/static-autocomplete/select/static-select.module';
import { UploadModule } from '@blockframes/media/components/upload/upload.module';

// Materials
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';

@NgModule({
  declarations: [MovieFormFinancialDetailsComponent, BudgetPipe],
  exports: [MovieFormFinancialDetailsComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    TunnelPageModule,
    StaticSelectModule,
    UploadModule,

    // Material
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDividerModule,
    RouterModule.forChild([{ path: '', component: MovieFormFinancialDetailsComponent }])

  ],
})
export class MovieFormFinancialDetailsModule { }
