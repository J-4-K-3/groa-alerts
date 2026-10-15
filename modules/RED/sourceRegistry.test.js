
import {
  registerSource,
  getSource,
  listSources,
  recordCollectionOutcome,
  setSourceEnabled,
} from "./sourceRegistry.js";

import {
  collectSource,
} from "./collectionService.js";

const source = registerSource({
  source_name: "Example Public Information Source",
  source_type: "government",
  source_uri: "https://example.org/reports",
  language: "en",
});

console.log("Registered:", source.source_id);
console.log("Initial state:", source.collection_state);
// Expected: never_checked

recordCollectionOutcome(source.source_id, {
  outcome: "failed",
  error: "Connection timeout",
});

console.log(
  "After failed collection:",
  getSource(source.source_id).collection_state
);
// Expected: failed

console.log(
  "Last successful access:",
  getSource(source.source_id).last_successful_access_at
);
// Expected: null

setSourceEnabled(source.source_id, false);

console.log(
  "Enabled sources:",
  listSources({ state: "enabled" }).length
);
// The new source should not be included.

console.log("R.E.D. source registry tests completed.");

/* ============================================== 
  COLLECTION SERVICE 
============================================== */

const result = await collectSource(source.source_id);

console.log("Collection successful:", result.success);
console.log("Collection outcome:", result.outcome);
console.log("Retrieved at:", result.collected_at);
console.log("Source status:", getSource(source.source_id)
  .collection_state);

if (result.success) {
  console.log("HTTP status:", result.http_status);
  console.log("Content type:", result.content_type);
  console.log("Verified:", result.verified);
  // Expected: false
}
