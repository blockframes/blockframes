// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
// Components
import { TemplateEditableComponent } from './pages/template-editable/template-editable.component';
import { TemplateListComponent } from './pages/template-list/template-list.component';
import { TemplateActiveGuard } from './guards/template-active.guard';
import { TemplateItemComponent } from './components/template-item/template-item.component';
import { TemplateAddComponent } from './components/template-add/template-add.component';
import { EditableModule } from '@blockframes/ui';
import { ConfirmModule } from '@blockframes/ui';
import { TemplateEmptyComponent } from './components/template-empty/template-empty.component';
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
    path: ':templateId',
    component: TemplateEditableComponent,
    canActivate: [TemplateActiveGuard],
    canDeactivate: [TemplateActiveGuard],
  }
]

@NgModule({
  declarations: [
    TemplateEditableComponent,
    TemplateListComponent,
    TemplateItemComponent,
    TemplateAddComponent,
    TemplateEmptyComponent,
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
    EditableModule,
    RouterModule.forChild(routes)
  ],
  entryComponents: [TemplateAddComponent]
})
export class TemplateModule {}
