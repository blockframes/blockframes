import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { EditComponent } from './edit.component';
import { DisplayNameModule } from '@blockframes/utils/pipes';
import { FilePickerModule } from '@blockframes/media/file/picker/picker.module';
import { EventEditModule as LayoutEventEditModule } from '@blockframes/event/layout/edit/edit.module';
import { FilePreviewModule } from '@blockframes/media/file/preview/preview.module';

// Material
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FileNameModule } from '@blockframes/utils/pipes/fileName.pipe';
import { EventAnalyticsModule } from '@blockframes/event/components/analytics/analytics.module';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [EditComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    LayoutEventEditModule,
    EventAnalyticsModule,
    DisplayNameModule,
    FilePickerModule,
    FileNameModule,
    ClipboardModule,
    FilePreviewModule,

    // Material
    MatProgressSpinnerModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatTooltipModule,

    RouterModule.forChild([{ path: '', component: EditComponent }])
  ]
})
export class EventEditModule { }
