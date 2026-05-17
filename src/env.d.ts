/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
  readonly WP_OFFLINE?: string;
  readonly WP_USE_LOCAL?: string;
  readonly WPGRAPHQL_ENDPOINT?: string;
  readonly WP_GRAPHQL_URL?: string;
  readonly WP_FETCH_TIMEOUT_MS?: string;
  readonly WP_FETCH_RETRY?: string;
  readonly WP_REQUEST_DELAY_MS?: string;
  readonly PUBLIC_SITE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
/// <reference types="astro/client" />
