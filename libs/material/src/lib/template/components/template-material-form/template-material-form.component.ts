import { Component, ChangeDetectionStrategy, Output, EventEmitter, HostBinding } from '@angular/core';
import { ControlContainer } from '@angular/forms';
import { MaterialControl } from '../../forms/material.form';
import { FormEntity } from '@blockframes/utils';
import { MaterialTemplate } from '../../../material/+state';
import { Currencies } from '../../../delivery/+state/delivery.model';

@Component({
  selector: '[formGroup] template-material-form',
  templateUrl: './template-material-form.component.html',
  styleUrls: ['./template-material-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class TemplateMaterialFormComponent{

  @HostBinding('attr.page-id') pageId = 'template-form';

  @Output() delete = new EventEmitter<MaterialTemplate>();

  public currencies = Currencies;

  constructor(public controlContainer: ControlContainer) {}

  public get control() {
    return this.controlContainer.control as FormEntity<MaterialControl>;
  }
}
