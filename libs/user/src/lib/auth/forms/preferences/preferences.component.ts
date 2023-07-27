import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { PreferencesForm } from './preferences.form';
import { waterfallMediaGroups } from '@blockframes/model';

@Component({
  selector: 'auth-preferences-form',
  templateUrl: './preferences.component.html',
  styleUrls: ['./preferences.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PreferencesFormComponent {
  @Input() form: PreferencesForm;

  public waterfallMediaGroups = waterfallMediaGroups;
}