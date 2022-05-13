// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Component
import { HideEmailComponent } from './hide-email.component';

// Material
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { AppPipeModule } from '@blockframes/utils/pipes';

@NgModule({
  declarations: [HideEmailComponent],
  imports: [
    CommonModule,
    MatSlideToggleModule,
    AppPipeModule
  ],
  exports: [HideEmailComponent]
})
export class HideEmailModule { }
