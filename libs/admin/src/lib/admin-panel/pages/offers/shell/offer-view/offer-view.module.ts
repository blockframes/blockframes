import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GetUserPipe, OfferViewComponent } from './offer-view.component';
import { RouterModule } from '@angular/router';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { TableFilterModule } from '@blockframes/ui/list/table-filter/table-filter.module';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [OfferViewComponent, GetUserPipe],
  imports: [
    CommonModule,
    TableFilterModule,
    ReactiveFormsModule,

    //Material
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,

    RouterModule.forChild([{ path: '', component: OfferViewComponent }]),
  ]
})
export class OfferViewModule { }
