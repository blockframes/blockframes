import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VideoComponent } from './video/video.component';
import { LocalComponent } from './participant/local/local.component';
import { RemoteComponent } from './participant/remote/remote.component';
import {MatGridListModule} from "@angular/material/grid-list";
import { DominantSpeakerComponent } from './participant/dominant-speaker/dominant-speaker.component';
import {FlexModule} from "@angular/flex-layout";



@NgModule({
  declarations: [VideoComponent, LocalComponent, RemoteComponent, DominantSpeakerComponent],
  exports: [VideoComponent],
    imports: [
        CommonModule,
        MatGridListModule,
        FlexModule,
    ]
})
export class MeetingModule { }
