import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NgModule } from '@angular/core';

// Routes
import { RouterModule, Routes } from '@angular/router';

// Components
import { EventComponent } from './event.component';

// Modules 
import { AuthWidgetModule } from '@blockframes/auth/components/widget/widget.module';

// Guards
import { EventTestGuard } from '../guard/event-test.guard';

const routes: Routes = [{
  path: ':eventId',
  component: EventComponent,
  canActivate: [EventTestGuard],
}];

@NgModule({
  declarations: [EventComponent],
  imports: [
    RouterModule.forChild(routes),
    // Angular
    CommonModule,
    FlexLayoutModule,

    // Modules
    AuthWidgetModule
  ]
})
export class EventModule { }
