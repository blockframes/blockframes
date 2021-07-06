import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import type { RunsForm } from '@blockframes/contract/avails/form/runs.form';

@Component({
  selector: 'runs-form',
  templateUrl: 'runs-form.component.html',
  styleUrls: ['./runs-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RunsFormComponent {
  @Input() form: RunsForm;
  public periods = ['days', 'weeks', 'months', 'years'];
}