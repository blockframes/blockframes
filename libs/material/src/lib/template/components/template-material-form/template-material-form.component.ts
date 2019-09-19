import { Component, ChangeDetectionStrategy, Output, EventEmitter, Input, HostBinding } from '@angular/core';
import { ControlContainer } from '@angular/forms';
import { Material } from '../../../material/+state';
import { Currencies } from '../../../delivery/+state';
import { MaterialControl } from '../../forms/material.form';
import { FormElement } from '@blockframes/utils';

@Component({
  selector: '[formGroup] template-material-form',
  templateUrl: './template-material-form.component.html',
  styleUrls: ['./template-material-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class TemplateMaterialFormComponent{

  @HostBinding('attr.page-id') pageId = 'template-form';

  @Output() delete = new EventEmitter<Material>();

  public currencies = Currencies;

  constructor(public controlContainer: ControlContainer) {}

  public get control() {
    return this.controlContainer.control as FormElement<MaterialControl>;
  }
}
