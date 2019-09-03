// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

// Modules
import { EditableModule, EditableSidenavModule } from '@blockframes/ui';
import { ConfirmModule } from '@blockframes/ui';

// Components
import { TemplateItemComponent } from './components/template-item/template-item.component';
import { TemplateAddComponent } from './components/template-add/template-add.component';
import { TemplateMaterialRepertoryComponent } from './components/template-material-repertory/template-material-repertory.component';
import { TemplateMaterialFormComponent } from './components/template-material-form/template-material-form.component';
import { TemplateRepertoryComponent } from './components/template-repertory/template-repertory.component';

// Pages
import { TemplateEditableComponent } from './pages/template-editable/template-editable.component';
import { TemplateListComponent } from './pages/template-list/template-list.component';
import { TemplateCreateComponent } from './pages/template-create/template-create.component';

// Guards
import { TemplateActiveGuard } from './guards/template-active.guard';

// Material
import { MatCardModule } from '@angular/material/card';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../material/material.module';
import {MatExpansionModule} from '@angular/material/expansion';
import { TemplateListGuard } from './guards/template-list.guard';
import { MatSelectModule, MatSortModule } from '@angular/material';
import { MatTableModule } from '@angular/material/table'

const routes: Routes = [
  { path: '', redirectTo: 'list', pathMatch: 'full' },
  {
    path: 'create',
    component: TemplateCreateComponent
  },
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
    TemplateCreateComponent,
    TemplateMaterialRepertoryComponent,
    TemplateMaterialFormComponent,
    TemplateRepertoryComponent
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
    EditableSidenavModule,
    MatTableModule,
    MatSelectModule,
    MatSortModule,
    RouterModule.forChild(routes)
  ],
  entryComponents: [TemplateAddComponent]
})
export class TemplateModule {}
