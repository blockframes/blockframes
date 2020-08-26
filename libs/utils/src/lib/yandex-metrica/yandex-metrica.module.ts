import { YandexMetricaService, YM_CONFIG } from './yandex-metrica.service';
import { NgModule, ModuleWithProviders } from '@angular/core';

@NgModule()
export class YandexMetricaModule {
  public static forRoot(config: number): ModuleWithProviders<YandexMetricaModule> {
    return {
      ngModule: YandexMetricaModule,
      providers: [YandexMetricaService, { provide: YM_CONFIG, useValue: config }]
    };
  }
}
