import * as XLSX from 'xlsx';

type AOA = any[][];

export interface SheetTab {
  name: string;
  index: number;
  headers: any[];
  rows: any[][];
}

export class ExcelUtils {
  private tabs : SheetTab[] = [];
  private fileName = 'SheetJS.xlsx';

  public import (bytes: Uint8Array) : void {
    this.tabs = [];

    // convert Uint8Array to binary String
    let bstr = "";
    for (var i = 0; i < bytes.byteLength; i++) {
      bstr += String.fromCharCode(bytes[i]);
    }

    const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });

    // For each tab
    wb.SheetNames.forEach( (name, index)  => {
      const ws: XLSX.WorkSheet = wb.Sheets[name];
      const rows = <AOA>(XLSX.utils.sheet_to_json(ws, { header: 1 }));
      const headers = rows.shift();
      const sheetTab : SheetTab = {
        name,
        index,
        headers,
        rows
      };

      this.tabs.push(sheetTab);
    });
  }


  public export(): void {

    /* generate workbook and */
    const wb: XLSX.WorkBook = XLSX.utils.book_new();

    /* generate worksheet for each tab*/
    this.tabs.forEach(sheet => {
      let data = [];
      data.push(sheet.headers);
      data = data.concat(sheet.rows);
      const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(data);

      /* add the worksheet */
      XLSX.utils.book_append_sheet(wb, ws, sheet.name);
    })
    
    /* save to file */
    XLSX.writeFile(wb, this.fileName);
  }

  public removeFile() : void {
    this.tabs = [];
  }

  public get sheets() : SheetTab[] {
    return this.tabs;
  }
}
