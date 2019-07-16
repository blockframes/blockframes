import { Component, Output, EventEmitter, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'org-action-item',
  templateUrl: './organization-action-item.component.html',
  styleUrls: ['./organization-action-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationActionItemComponent {

  // TODO: replace any when you know how the actions interface looks like
  @Input() actionItems: any;

  // TODO: replace void for somehting like Actions.id to let the parent component know
  // which action the user clicked
  @Output() clickedOnSigners: EventEmitter<void> = new EventEmitter();

  // TODO: replace void for somehting like Actions.id to let the parent component know
  // which action the user clicked
  @Output() clickedOnCounterSigners: EventEmitter<void> = new EventEmitter();
}
