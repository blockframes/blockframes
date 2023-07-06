
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';

import { RightholderRole } from '@blockframes/model';
import { boolean } from '@blockframes/utils/decorators/decorators';
import { WaterfallService } from '@blockframes/waterfall/waterfall.service';


@Component({
  selector: '[rightholdersForm]waterfall-right-holder-form',
  templateUrl: './right-holder-form.component.html',
  styleUrls: ['./right-holder-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RightHolderFormComponent {

  @Input() @boolean skippable = false;
  @Input() rightholdersForm: FormArray<FormGroup<{ id: FormControl<string>, name: FormControl<string>, roles: FormControl<RightholderRole[]> }>>;

  @Output() skip = new EventEmitter<void>();

  constructor(
    private waterfallService: WaterfallService,
  ) { }

  add() {
    this.rightholdersForm.push(new FormGroup({ id: new FormControl(this.waterfallService.createId()), name: new FormControl(''), roles: new FormControl([]) }),);
  }
  
  remove(index: number) {
    this.rightholdersForm.removeAt(index);
  }
}

