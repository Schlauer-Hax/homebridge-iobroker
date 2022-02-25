import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';

import { IoBrokerPlatform } from './platform';

export class IoBrokerLightAccessory {
  private service: Service;

  config = this.platform.config.devices.find(device => device.name === this.accessory.displayName);
  constructor(
    private readonly platform: IoBrokerPlatform,
    private readonly accessory: PlatformAccessory,
  ) {

    // set accessory information
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'IoBroker')
      .setCharacteristic(this.platform.Characteristic.Model, 'IoBroker')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, 'IoBroker');

    // get the LightBulb service if it exists, otherwise create a new LightBulb service
    // you can create multiple services for each accessory
    this.service = this.accessory.getService(this.platform.Service.Lightbulb) || this.accessory.addService(this.platform.Service.Lightbulb);

    // set the service name, this is what is displayed as the default name on the Home app
    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.displayName);

    // each service must implement at-minimum the "required characteristics" for the given service type
    // see https://developers.homebridge.io/#/service/Lightbulb

    // register handlers for the On/Off Characteristic
    // see https://developers.homebridge.io/#/characteristic/On
    this.service.getCharacteristic(this.platform.Characteristic.On)
      .onSet(this.setOn.bind(this))                // SET - bind to the `setOn` method below
      .onGet(this.getOn.bind(this));               // GET - bind to the `getOn` method below

    if (this.config.brightness) {
      // add a Brightness Characteristic
      // see https://developers.homebridge.io/#/characteristic/Brightness
      this.service.getCharacteristic(this.platform.Characteristic.Brightness)
        .onSet(this.setBrightness.bind(this))       // SET - bind to the 'setBrightness` method below
        .onGet(this.getBrightness.bind(this));      // GET - bind to the 'getBrightness' method below
    }
    if (this.config.colortemp) {
      // add a Color Temperature Characteristic
      // see https://developers.homebridge.io/#/characteristic/ColorTemperature
      this.service.getCharacteristic(this.platform.Characteristic.ColorTemperature)
        .onSet(this.setColorTemperature.bind(this)) // SET - bind to the 'setColorTemperature' method below
        .onGet(this.getColorTemperature.bind(this)); // GET - bind to the 'getColorTemperature' method below
    }
  }

  /**
   * Handle "SET" requests from HomeKit
   * These are sent when the user changes the state of an accessory, for example, turning on a Light bulb.
   */
  async setOn(value: CharacteristicValue) {
    this.set(this.config.onstate, value);
  }

  /**
   * Handle the "GET" requests from HomeKit
   * These are sent when HomeKit wants to know the current state of the accessory, for example, checking if a Light bulb is on.
   *
   * GET requests should return as fast as possbile. A long delay here will result in
   * HomeKit being unresponsive and a bad user experience in general.
   *
   * If your device takes time to respond you should update the status of your device
   * asynchronously instead using the `updateCharacteristic` method instead.

   * @example
   * this.service.updateCharacteristic(this.platform.Characteristic.On, true)
   */
  async getOn(): Promise<CharacteristicValue> {
    return this.get(this.config.onstate);
  }

  async setBrightness(value: CharacteristicValue) {
    this.set(this.config.brightness, value);
  }

  async getBrightness(): Promise<CharacteristicValue> {
    return this.get(this.config.brightness);
  }

  async setColorTemperature(value: CharacteristicValue) {
    this.set(this.config.colortemp, value);
  }

  async getColorTemperature(): Promise<CharacteristicValue> {
    return this.get(this.config.colortemp);
  }

  async get(state: string, args?): Promise<CharacteristicValue> {
    return new Promise((resolve) => {
      this.platform.getData('get/'+state, args).then((data) => {
        resolve(JSON.parse(data).val);
      });
    });
  }

  async set(state: string, value: CharacteristicValue) {
    return new Promise((resolve) => {
      this.platform.getData('set/'+state, 'value='+value).then((data) => {
        resolve(JSON.parse(data).val);
      });
    });
  }
}
