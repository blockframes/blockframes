import { WorkBook, WorkSheet, utils, writeFile }  from 'xlsx';
import { SheetTab } from './import';

export function exportSpreadsheet(tabs: SheetTab[], fileName: string ='SheetJS.xlsx' ): void {

  const workBook: WorkBook = utils.book_new();

  /* generate worksheet for each tab*/
  tabs.forEach(sheet => {
    let data = [];
    data.push(sheet.headers);
    data = data.concat(sheet.rows);
    const workSheet: WorkSheet = utils.aoa_to_sheet(data);

    /* add the worksheet */
    utils.book_append_sheet(workBook, workSheet, sheet.name);
  })
  
  /* save to file */
  writeFile(workBook, fileName);
}