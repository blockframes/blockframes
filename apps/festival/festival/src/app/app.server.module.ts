import { NgModule } from '@angular/core';
import { ServerModule } from '@angular/platform-server';

import { AppModule } from './app.module';
import { AppComponent } from './app.component';
import { YandexMetricaService } from '@blockframes/utils/yandex-metrica/yandex-metrica.service';

@NgModule({
  imports: [
    AppModule,
    ServerModule,
  ],
  bootstrap: [AppComponent],
  providers: [
    {
        provide: YandexMetricaService,
        useClass: class { }
    }
  ]
})
export class AppServerModule {}
