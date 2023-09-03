const {KnownDevices} = require('puppeteer-core')


const devices = Object.keys(KnownDevices).filter(deviceName => {
    const device = KnownDevices[deviceName];
    return (
        device.viewport.width <= 450 &&
        !device.viewport.isLandscape &&
        device.viewport.isMobile
    );
}).map(deviceName => KnownDevices[deviceName])


const genRandomDevice = () => devices[Object.keys(devices)[Math.floor(Math.random() * Object.keys(devices).length)]]


module.exports = genRandomDevice