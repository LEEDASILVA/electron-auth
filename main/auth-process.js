const { BrowserWindow } = require('electron')
const authService = require('../services/auth-service')
const createAppWindow = require('../main/app-process')

let win

// like the name says this will create a instance of browserwindow to load
// the login page using the authorization server url
const createAuthWindow = () => {
  destroyAuthWin()

  // the webPreferences specifies that the process associated with the window
  // doesnt require access to local resources, nor does it need to communicate
  // with the main process. better security
  win = new BrowserWindow({
    width: 1000,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      enableRemoteModule: false,
    },
  })

  win.loadURL(authService.getAuthenticationURL())

  const {
    session: { webRequest },
  } = win.webContents

  const filter = {
    urls: ['http://localhost/callback*'],
  }

  // Finally, it is important to notice that Auth0 will call the http://localhost/callback URL 
  // right after it authenticates your users. As such, you are defining a listener using the onBeforeRequest()
  // function that Electron will trigger when Auth0 calls the callback URL. The goal of this listener is to load users'
  // tokens (authService.loadTokens(url)) to then create the main window of your app (createAppWindow()) and destroy the current one (destroyAuthWin())
  webRequest.onBeforeRequest(filter, async ({ url }) => {
    await authService.loadToken(url)
    createAppWindow()
    return destroyAuthWin()
  })

  win.on('authenticated', () => {
    destroyAuthWin()
  })

  win.on('closed', () => {
    win = null
  })
}

const destroyAuthWin = () => {
  if (!win) return
  win.close()
  win = null
}

const createLogoutWindow = () => {
  const logoutWindow = new BrowserWindow({
    show: false,
  })

  logoutWindow.loadURL(authService.getLogOutUrl())

  logoutWindow.on('ready-to-show', async () => {
    logoutWindow.close()
    await authService.logout()
  })
}

module.exports = {
  createAuthWindow,
  createLogoutWindow,
}
