import { WorkBook, WorkSheet, utils, read}  from 'xlsx';

type Matrix = any[][]; //@todo find better type

export interface SheetTab {
  name: string;
  index: number;
  headers: any[];
  rows: any[][];
}

export function importSpreadsheet(bytes: Uint8Array) : SheetTab[] {

  // convert Uint8Array to binary String
  let bstr = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    bstr += String.fromCharCode(bytes[i]);
  }

  const workBook: WorkBook = read(bstr, { type: 'binary' });

  // For each tab
  const tabs : SheetTab[] = workBook.SheetNames.map( (name, index)  => {
    const worksheet: WorkSheet = workBook.Sheets[name];
    const rows = <Matrix>(utils.sheet_to_json(worksheet, { header: 1 }));
    const headers = rows.shift();
    
    return { name, index, headers, rows } as SheetTab;
  });

  return tabs;
}