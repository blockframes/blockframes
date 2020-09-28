// Angular
import { Component, ChangeDetectionStrategy, Input, ChangeDetectorRef, OnInit, TemplateRef, ContentChild, OnDestroy } from '@angular/core';
import { AbstractControl, FormArray, FormGroup } from '@angular/forms';

// Blockframes
import { Scope } from '@blockframes/utils/static-model/staticModels';

// RxJs
import { Subscription } from 'rxjs';

@Component({
  selector: '[control] missing-control',
  templateUrl: './missing-control.component.html',
  styleUrls: ['./missing-control.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MissingControlComponent implements OnInit, OnDestroy {
  private sub: Subscription;

  @Input() control: AbstractControl;
  @Input() scope: Scope;
  @Input() type: string;
  @Input() link: string;
  @Input() fragment: string;
  @Input() isLast = true;

  @ContentChild(TemplateRef) child: TemplateRef<any>;

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.sub = this.control?.valueChanges.subscribe(_ => this.cdr.markForCheck());
  }

  isMissing(control: AbstractControl) {
    if (control instanceof FormArray) {
      return !control.controls.length;
    } else if (control instanceof FormGroup) {
      if (Object.keys(control.controls).length) {
        const values = Object.values(control.controls);
        return values.length ? values.some(c => this.isMissing(c)) : true;
      }
    }
    return !control?.value;
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }
}
