import { ChangeDetectionStrategy, Component, Input, TemplateRef, ViewChild } from "@angular/core";

@Component({
  selector: '[title][value][icon] analytics-metric-card',
  templateUrl: './metric-card.component.html',
  styleUrls: ['./metric-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MetricCardComponent {
  @Input() title: string;
  @Input() value: number;
  @Input() icon: string;

  @ViewChild(TemplateRef) templateRef: TemplateRef<unknown>;
}