import { createClient } from "next-sanity";

import { apiVersion, dataset, projectId } from "./env";

export const sanityClient = createClient({
  apiVersion,
  dataset,
  projectId,
  // The direct API avoids stale or intermittently unavailable CDN responses
  // while editors are working locally. Production keeps the CDN for speed.
  useCdn: process.env.NODE_ENV === "production",
});
