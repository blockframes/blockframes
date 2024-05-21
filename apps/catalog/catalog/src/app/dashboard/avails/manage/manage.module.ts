import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';

import { CatalogManageAvailsComponent } from './manage.component';
import { TermFormModule } from '@blockframes/contract/term/components/form/form.module'

@NgModule({
  declarations: [
    CatalogManageAvailsComponent,
  ],
  imports: [
    CommonModule,
    TermFormModule,
    //Material
    MatButtonModule,
    MatIconModule,

    RouterModule.forChild([{ path: '', component: CatalogManageAvailsComponent }]
    ),
  ]
})
export class CatalogManageAvailsModule { }
