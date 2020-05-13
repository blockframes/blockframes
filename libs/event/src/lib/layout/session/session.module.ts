import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventSessionComponent } from './session.component';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';


// Components
import { EventPlayerModule } from '../../components/player/player.module';
import { EventTimeModule } from '@blockframes/event/pipes/event-time.pipe';
import { ImgAssetModule } from '@blockframes/ui/theme';
import { ImageReferenceModule } from '@blockframes/ui/media/image-reference/image-reference.module';
import { DisplayNameModule } from "@blockframes/utils/pipes/display-name.module";

// Materials
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [EventSessionComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    //Component
    ImgAssetModule,
    DisplayNameModule,
    EventTimeModule,
    EventPlayerModule,
    ImageReferenceModule,
    //Material
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,

    RouterModule.forChild([{ path: '', component: EventSessionComponent }])
  ]
})
export class EventSessionModule { }
