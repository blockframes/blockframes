export function timestampObjectsToDate(docs: any[]) {
  if (!docs) {
    return [];
  }

  return docs.map(doc => {
    if (doc.date) {
      return { ...doc, date: doc.date.toDate() };
    } else {
      return doc;
    }
  });
}
