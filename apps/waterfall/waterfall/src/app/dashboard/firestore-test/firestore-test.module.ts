import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { ForModule } from '@rx-angular/template/for';
import { IfModule } from '@rx-angular/template/if';

import { GraphModule } from '@blockframes/waterfall/components/g6/graph/graph.module';
import { TreeModule } from '@blockframes/waterfall/components/g6/tree/tree.module';

// Component
import { FirestoreTestComponent } from './firestore-test.component';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ForModule,
    IfModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatSnackBarModule,
    MatSelectModule,
    GraphModule,
    TreeModule,
    // Router
    RouterModule.forChild([{ path: '', component: FirestoreTestComponent }])
  ],
  declarations: [FirestoreTestComponent],
})
export class FirestoreTestModule { }