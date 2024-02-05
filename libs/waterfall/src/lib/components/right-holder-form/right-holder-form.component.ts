
import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';

import { FormList } from '@blockframes/utils/form';
import { boolean } from '@blockframes/utils/decorators/decorators';
import { WaterfallService } from '../../waterfall.service';
import { WaterfallRightholderForm, WaterfallRightholderFormValue } from '../../form/right-holder.form';
import { RightholderRole, createWaterfallRightholder } from '@blockframes/model';
import { Subscription } from 'rxjs';

@Component({
  selector: '[rightholdersForm]waterfall-right-holder-form',
  templateUrl: './right-holder-form.component.html',
  styleUrls: ['./right-holder-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RightHolderFormComponent implements OnInit, OnDestroy {

  @Input() @boolean skippable = false;
  @Input() @boolean autoSave = false;
  @Input() rightholdersForm: FormList<WaterfallRightholderFormValue, WaterfallRightholderForm>;

  @Output() skip = new EventEmitter<void>();
  private sub: Subscription;

  constructor(
    private waterfallService: WaterfallService,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    this.sub = this.rightholdersForm.valueChanges.subscribe(() => this.cdr.markForCheck());
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  add(defaultRole?: RightholderRole) {
    this.rightholdersForm.add(createWaterfallRightholder({ id: this.waterfallService.createId(), roles: defaultRole ? [defaultRole] : [] }));
  }

  remove(index: number) {
    this.rightholdersForm.removeAt(index);
    this.rightholdersForm.markAsDirty();
  }
}

