import localSettings from "local.settings.json";

export function sourceLocalSettingsEnv() {
  const values = localSettings.Values;

  for (const [key, value] of Object.entries(values)) {
    process.env[key] = value;
  }
}
