import { NgModule } from "@angular/core";
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";

import { FlexLayoutModule } from "@angular/flex-layout";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatChipsModule } from "@angular/material/chips";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatTabsModule } from "@angular/material/tabs";
import { MatTooltipModule } from "@angular/material/tooltip";

import { KeyManagerListComponent } from "./key-manager-list/key-manager-list.component";
import { KeyManagerItemComponent } from "./key-manager-item/key-manager-item.component";
import { PasswordConfirmModule } from '@blockframes/ui/form';
import { UploadModule } from "@blockframes/ui";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    FlexLayoutModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    MatTabsModule,
    PasswordConfirmModule,
    UploadModule,
  ],
  declarations: [
    KeyManagerListComponent,
    KeyManagerItemComponent,
  ],
  exports: [
    KeyManagerListComponent,
  ],
})
export class KeyManagerModule {}
