import { fetchAllRecords } from "./lib/airtable";
import { SPEAKING } from "./lib/airtable-schema";

async function main() {
  const records = await fetchAllRecords("appKlfvxdXofNlFfk", SPEAKING.LESSONS.TABLE_ID, { maxRecords: 2 });
  console.log(JSON.stringify(records, null, 2));
}
main().catch(console.error);
