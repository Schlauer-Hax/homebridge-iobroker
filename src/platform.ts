import { API, DynamicPlatformPlugin, Logger, PlatformAccessory, PlatformConfig, Service, Characteristic } from 'homebridge';

import { PLATFORM_NAME, PLUGIN_NAME } from './settings';
import { IoBrokerLightAccessory } from './platformAccessory';
import { get } from 'http';

export class IoBrokerPlatform implements DynamicPlatformPlugin {
  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;

  public readonly accessories: PlatformAccessory[] = [];

  constructor(
    public readonly log: Logger,
    public readonly config: PlatformConfig,
    public readonly api: API,
  ) {
    this.log.debug('Finished initializing platform:', this.config.name);
    this.api.on('didFinishLaunching', () => {
      log.debug('Executed didFinishLaunching callback');
      this.discoverDevices();
    });
  }

  configureAccessory(accessory: PlatformAccessory) {
    this.log.info('Loading accessory from cache:', accessory.displayName);
    this.accessories.push(accessory);
  }

  discoverDevices() {
    this.getData('help').then(() => {
      this.log.info('Reached IoBroker. Adding Devices...');
      this.config.devices.forEach(device => {
        const uuid = this.api.hap.uuid.generate(device.name);
        const existingAccessory = this.accessories.find(accessory => accessory.UUID === uuid);

        if (existingAccessory) {
          this.log.info('Restoring existing accessory from cache:', existingAccessory.displayName);
          new IoBrokerLightAccessory(this, existingAccessory);
        } else {
          this.log.info('Adding new accessory:', device.name);

          const accessory = new this.api.platformAccessory(device.name, uuid);
          new IoBrokerLightAccessory(this, accessory);
          this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
        }
      });
    });
  }

  getData(command, args?): Promise<string> {
    return new Promise((resolve) => {
      const url = 'http://' + this.config.url + ':' + this.config.port + '/' + command + (args ? '?'+args : '');
      this.log.debug(url);
      get(url, (res) => {
        let body = '';
        res.on('readable', () => {
          body += res.read();
        });
        res.on('end', () => {
          resolve(body);
        });
      });
    });
  }
}
