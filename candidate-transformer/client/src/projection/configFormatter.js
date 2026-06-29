import { defaultProjectionConfig } from "./defaultProjectionConfig";

export function formatDefaultProjectionConfig() {
  return JSON.stringify(defaultProjectionConfig, null, 2);
}

