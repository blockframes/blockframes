import { Component } from '@angular/core';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';

@Component({
    selector: 'catalog-success',
    templateUrl: 'success.component.html',
    styleUrls: ['success.component.scss']
})
export class SuccessComponent {
    constructor(private dynTitle: DynamicTitleService) {
        this.dynTitle.setPageTitle('Success');
    }
}