// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
// Components
import { TemplateFormComponent } from './template-form/template-form.component';
import { TemplateListComponent } from './template-list/template-list.component';
import { TemplateActiveGuard } from './guards/template-active.guard';
import { TemplateItemComponent } from './template-item/template-item.component';
import { TemplateAddComponent } from './template-add/template-add.component';
import { ConfirmModule } from '@blockframes/ui';
// Material
import { MatCardModule } from '@angular/material/card';
import { FlexLayoutModule } from '@angular/flex-layout';
import {
  MatButtonModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatSidenavModule
} from '@angular/material';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../material/material.module';
import {MatExpansionModule} from '@angular/material/expansion';
import { TemplateListGuard } from './guards/template-list.guard';

const routes: Routes = [
  { path: '', redirectTo: 'list', pathMatch: 'full' },
  { 
    path: 'list', 
    component: TemplateListComponent,
    canActivate: [TemplateListGuard],
    canDeactivate: [TemplateListGuard],
  },
  { 
    path: ':orgId/:templateId',
    component: TemplateFormComponent, // TODO rename in TemplateActiveForm
    canActivate: [TemplateActiveGuard],
    canDeactivate: [TemplateActiveGuard],
  }
]

@NgModule({
  declarations: [
    TemplateFormComponent,
    TemplateListComponent,
    TemplateItemComponent,
    TemplateAddComponent,
  ],
  imports: [
    CommonModule,
    MatCardModule,
    FlexLayoutModule,
    MatIconModule,
    MatSidenavModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatListModule,
    MatButtonModule,
    MatMenuModule,
    MatExpansionModule,
    MaterialModule,
    ConfirmModule,
    RouterModule.forChild(routes)
  ],
  entryComponents: [TemplateAddComponent]
})
export class TemplateModule {}
