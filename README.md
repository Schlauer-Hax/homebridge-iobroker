# homebridge-iobroker2

This plugin uses simple-api to provide iobroker states to homebridge as a
Lightbulb

## Installation

1. Install Homebridge by following
   [the instructions](https://github.com/homebridge/homebridge/wiki).
1. Install this plugin using
   [Homebridge Config UI X](https://github.com/oznu/homebridge-config-ui-x), or
   by running `npm install -g homebridge-iobroker2`.
1. Install and configure the
   [simple-api](https://github.com/ioBroker/ioBroker.simple-api) on your running
   iobroker server.
1. Add the configuration to your homebridge config.json.

## Configuration

In most cases, simply adding this plugin to the homebridge config.json will be
enough:

```json
"platforms": [
  {
    "platform" : "IoBroker",
    "name" : "IoBroker",
    "url": "192.168.xx.xx",
    "port": 8087,
    "devices": [
        {
            "name": "FirstState",
            "onstate": "0_userdata.0.firststate"
        },
        {
            "name": "SecondState",
            "onstate": "0_userdata.0.secondstate"
        }
    ]
}
]
```
