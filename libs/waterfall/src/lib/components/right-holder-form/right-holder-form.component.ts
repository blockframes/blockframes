
import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

import { FormList } from '@blockframes/utils/form';
import { boolean } from '@blockframes/utils/decorators/decorators';
import { WaterfallService } from '../../waterfall.service';
import { WaterfallRightholderForm, WaterfallRightholderFormValue } from '../../form/right-holder.form';
import { createWaterfallRightholder } from '@blockframes/model';

@Component({
  selector: '[rightholdersForm]waterfall-right-holder-form',
  templateUrl: './right-holder-form.component.html',
  styleUrls: ['./right-holder-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RightHolderFormComponent {

  @Input() @boolean skippable = false;
  @Input() rightholdersForm: FormList<WaterfallRightholderFormValue, WaterfallRightholderForm>;

  @Output() skip = new EventEmitter<void>();

  constructor(
    private waterfallService: WaterfallService,
  ) { }

  add() {
    this.rightholdersForm.add(createWaterfallRightholder({ id: this.waterfallService.createId() }));
  }

  remove(index: number) {
    this.rightholdersForm.removeAt(index);
    this.rightholdersForm.markAsDirty();
  }
}

