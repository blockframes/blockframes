import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FlexLayoutModule } from "@angular/flex-layout";
import { SuccessComponent } from "./success.component";
import { RouterModule } from "@angular/router";
import { MatButtonModule } from "@angular/material/button";
import { ImageModule } from '@blockframes/media/image/directives/image.module';

@NgModule({
    imports: [
        CommonModule,
        FlexLayoutModule,
        ImageModule,
        RouterModule.forChild([{ path: '', component: SuccessComponent }]),
        MatButtonModule
    ],
    declarations: [SuccessComponent],
})
export class SuccessModule { }
