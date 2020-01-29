import { Component, ChangeDetectionStrategy, Input, ChangeDetectorRef, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: '[control] [link] missing-control',
  templateUrl: './missing-control.component.html',
  styleUrls: ['./missing-control.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MissingControlComponent implements OnInit {
  @Input() control: FormControl;
  @Input() label: string;
  @Input() link: string;
  @Input() isLast = true;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.control.valueChanges.subscribe(_ => this.cdr.markForCheck());
  }
}
