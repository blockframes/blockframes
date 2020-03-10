import { YandexMetricaService } from './yandex-metrica.service';
import { NgModule, ModuleWithProviders, InjectionToken } from '@angular/core';

export const YM_CONFIG = new InjectionToken('ngx-metrika Config');

@NgModule()
export class YandexMetricaModule {
    public static forRoot(config: number): ModuleWithProviders {
        return {
            ngModule: YandexMetricaModule,
            providers: [
                YandexMetricaService,
                { provide: YM_CONFIG, useValue: config }
            ]
        }
    }
}