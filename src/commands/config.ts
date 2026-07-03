import {
  getConfigFilePath,
  getConfigValue,
  loadConfig,
  parseConfigKey,
  saveConfig,
  setConfigValue
} from "../config/config.js";

export async function showConfigValue(key: string): Promise<void> {
  const configKey = parseConfigKey(key);
  const config = await loadConfig();
  console.log(getConfigValue(config, configKey));
}

export async function updateConfigValue(key: string, value: string): Promise<void> {
  const configKey = parseConfigKey(key);
  const config = await loadConfig();
  const updatedConfig = setConfigValue(config, configKey, value);

  await saveConfig(updatedConfig);

  console.log(`Updated ${configKey}.`);
  console.log(`Config file: ${getConfigFilePath()}`);
}
