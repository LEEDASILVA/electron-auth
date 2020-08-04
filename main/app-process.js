const { BrowserWindow } = require('electron')

const createwAppWindow = () => {
  let win = new BrowserWindow({
    width: 1000,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      enableRemoteModule: false,
    },
  })

  win.loadFile('./renderers/home.html')

  win.on('close', () => (win = null))
}

module.exports = createwAppWindow