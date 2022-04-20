// Angular
import {
  Component,
  ChangeDetectionStrategy,
  Input,
  ChangeDetectorRef,
  OnInit,
  TemplateRef,
  ContentChild,
  OnDestroy
} from '@angular/core';

import { AbstractControl, FormArray, FormGroup } from '@angular/forms';

// Blockframes
import { Scope } from '@blockframes/model';

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
  @Input() link: string | string[];
  @Input() fragment: string;

  getStatus = getStatus;

  @ContentChild(TemplateRef) child: TemplateRef<unknown>;

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.sub = this.control?.valueChanges.subscribe(() => this.cdr.markForCheck());
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }
}

function getStatus(control: AbstractControl): 'error' | 'valid' | 'missing' {
  if (control.invalid) return 'error';

  if (control instanceof FormArray) {
    if (!control.controls.length) return 'missing';

    const hasError = control.controls.some(ctrl => getStatus(ctrl) === 'error');

    if (hasError) return 'error';
    return 'valid';
  }
  if (control instanceof FormGroup) {
    const controls = Object.values(control.controls)
    if (!controls.length) return 'missing';

    const hasValue = controls.map(getStatus);

    if (hasValue.includes('missing')) return 'missing';

    const hasError = controls.some(ctrl => getStatus(ctrl) === 'error');

    if (hasError) return 'error';
    return 'valid';
  }
  if (Array.isArray(control?.value)) {
    if (!control?.value.length) return 'missing';
    return 'valid';
  }
  if (control.value === null || control.value === undefined || control.value === '') return 'missing';
  return 'valid'
}
