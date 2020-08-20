import { staticModels, staticConsts } from '@blockframes/utils/static-model';
import { Component, ChangeDetectionStrategy, Input, ContentChild, TemplateRef, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: '[scope][type][control] static-select',
  templateUrl: './static-select.component.html',
  styleUrls: ['./static-select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StaticSelectComponent implements OnInit {

  public _scope: [];
  @Input() scope;
  @Input() type: 'constant' | 'model';
  @Input() control: FormControl;
  @Input() mode: 'legacy' | 'standard' | 'fill' | 'outline' = 'outline';
  @Input() placeholder: string;
  @ContentChild(TemplateRef) template: TemplateRef<any>;

  ngOnInit() {
    if(this.type === 'constant') {
      this._scope = staticConsts[this.scope];
    } else {
      this._scope = staticModels[this.scope];
    }
  }
}
