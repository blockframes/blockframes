import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';

// Material
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

// Modules
import { EventInfoModule } from '../../components/event-info/event-info.module';

// Components
import { EventComponent } from './event.component';

@NgModule({
  imports: [
    CommonModule,
    MatIconModule,
    MatCardModule,
    FlexLayoutModule,
    EventInfoModule,
    RouterModule,
  ],
  declarations: [
    EventComponent,
  ]
})
export class EventModule { }
