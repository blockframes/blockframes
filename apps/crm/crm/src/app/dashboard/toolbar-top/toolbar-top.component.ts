import { Component, ChangeDetectionStrategy, Inject } from '@angular/core';
import { EmulatorsConfig, EMULATORS_CONFIG } from '@blockframes/utils/emulator-front-setup';
import { firebaseRegion, firebase } from '@env';
const { projectId } = firebase();

@Component({
  selector: 'crm-toolbar-top',
  templateUrl: './toolbar-top.component.html',
  styleUrls: ['./toolbar-top.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToolbarTopComponent {
  constructor(@Inject(EMULATORS_CONFIG) private emulatorsConfig: EmulatorsConfig) {}

  updateAirtable() {
    const url = this.emulatorsConfig.functions
      ? `http://localhost:5001/${projectId}/${firebaseRegion}/updateAirtable`
      : `https://${firebaseRegion}-${projectId}.cloudfunctions.net/updateAirtable`;

    console.log('updating Airtable via ', url);
    fetch(url).then(async res => {
      const reader = res.body.getReader();
      const readResult = await reader.read();
      const response = new TextDecoder().decode(readResult.value);
      console.log(response);
    });
  }
}
