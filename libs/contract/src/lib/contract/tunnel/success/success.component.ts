import { Component, ChangeDetectionStrategy } from '@angular/core';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';

@Component({
    selector: 'contract-success',
    templateUrl: 'success.component.html',
    styleUrls: ['success.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SuccessComponent {
    constructor(private dynTitle: DynamicTitleService) {
        this.dynTitle.setPageTitle('Success');
    }
}