
import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';

import { FormList } from '@blockframes/utils/form';
import { boolean } from '@blockframes/utils/decorators/decorators';
import { WaterfallService } from '../../../waterfall.service';
import { WaterfallRightholderForm, WaterfallRightholderFormValue } from '../../../form/right-holder.form';
import { RightholderRole, Waterfall, createWaterfallRightholder } from '@blockframes/model';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmInputComponent } from '@blockframes/ui/confirm-input/confirm-input.component';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';

@Component({
  selector: '[rightholdersForm]waterfall-rightholder-form',
  templateUrl: './rightholder-form.component.html',
  styleUrls: ['./rightholder-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RightHolderFormComponent implements OnInit, OnDestroy {

  @Input() @boolean skippable = false;
  @Input() @boolean autoSave = false;
  @Input() rightholdersForm: FormList<WaterfallRightholderFormValue, WaterfallRightholderForm>;
  @Input() waterfall: Waterfall;

  @Output() skip = new EventEmitter<void>();
  private sub: Subscription;

  constructor(
    private waterfallService: WaterfallService,
    private dialog: MatDialog,
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
    const value = this.rightholdersForm.at(index).value;
    if (value?.id && this.waterfall.rightholders.find(r => r.id === value.id)) {
      this.dialog.open(ConfirmInputComponent, {
        data: createModalData({
          title: 'Delete Right Holder',
          subtitle: `Pay attention, if you delete the following Right Holder, it could will have an impact on the whole Waterfall.`,
          text: `Please type "DELETE" to confirm.`,
          confirmationWord: 'DELETE',
          confirmButtonText: 'Delete Right Holder',
          onConfirm: () => {
            this.rightholdersForm.removeAt(index);
            this.rightholdersForm.markAsDirty();
          },
        })
      });
    } else {
      this.rightholdersForm.removeAt(index);
      this.rightholdersForm.markAsDirty();
    }
  }
}

