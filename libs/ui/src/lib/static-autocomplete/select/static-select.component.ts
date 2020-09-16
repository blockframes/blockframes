// Angular
import { Component, ChangeDetectionStrategy, Input, ContentChild, TemplateRef, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

// Blockframes
import { staticModels, staticConsts } from '@blockframes/utils/static-model';
import { boolean } from '@blockframes/utils/decorators/decorators';

@Component({
  selector: '[scope][type][control] static-select',
  templateUrl: './static-select.component.html',
  styleUrls: ['./static-select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StaticSelectComponent implements OnInit {

  public _scope: string[];
  @Input() scope;
  @Input() type: 'constant' | 'model';
  @Input() control: FormControl;
  @Input() mode: 'legacy' | 'standard' | 'fill' | 'outline' = 'outline';
  @Input() placeholder: string;
  @Input() @boolean required: boolean;
  @Input() set withoutValues(toFilterValue: any[]) {
    if (this.type === 'constant') {
      this._scope = Object.keys(staticConsts[this.scope]).filter(scopeValue => !toFilterValue.includes(scopeValue))
    } else {
      this._scope = staticModels[this.scope].filter(scopeValue => !toFilterValue.includes(scopeValue.slug))
    }
  }

  @ContentChild(TemplateRef) template: TemplateRef<any>;

  ngOnInit() {
    if (this.type === 'constant' && !this._scope.length) {
      this._scope = staticConsts[this.scope];
    } else if (!this._scope) {
      this._scope = staticModels[this.scope];
    }
  }
}
