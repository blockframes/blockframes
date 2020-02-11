import { Component, ChangeDetectionStrategy, Input, ChangeDetectorRef, OnInit, TemplateRef, ContentChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Scope } from '@blockframes/utils/static-model/staticModels';

@Component({
  selector: '[control] [link] missing-control',
  templateUrl: './missing-control.component.html',
  styleUrls: ['./missing-control.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MissingControlComponent implements OnInit {
  @Input() control: FormControl;
  @Input() scope: Scope;
  @Input() link: string;
  @Input() isLast = true;

  @ContentChild(TemplateRef, { static: false }) child: TemplateRef<any>;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.control.valueChanges.subscribe(_ => this.cdr.markForCheck());
  }
}
