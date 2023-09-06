
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';

import { FormList } from '@blockframes/utils/form';
import { boolean } from '@blockframes/utils/decorators/decorators';
import { WaterfallService } from '@blockframes/waterfall/waterfall.service';
import { WaterfallRightholderForm, WaterfallRightholderFormValue } from '@blockframes/waterfall/form/right-holder.form';


@Component({
  selector: '[rightholdersForm]waterfall-right-holder-form',
  templateUrl: './right-holder-form.component.html',
  styleUrls: ['./right-holder-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RightHolderFormComponent {

  @Input() @boolean skippable = false;
  @Input() rightholdersForm: FormList<WaterfallRightholderFormValue, WaterfallRightholderForm>;

  @Output() skip = new EventEmitter<void>();

  constructor(
    private waterfallService: WaterfallService,
  ) { }

  add() {
    this.rightholdersForm.push(new WaterfallRightholderForm({ id: this.waterfallService.createId(), name: '', roles: [] }));
  }
  
  remove(index: number) {
    this.rightholdersForm.removeAt(index);
  }
}

