// require all dependencies
const jwtDecode = require('jwt-decode')
const axios = require('axios')
const url = require('url')
const envVariables = require('../env-variables')
const keytar = require('keytar')
const os = require('os')

const { auth0Domain, clientID, apiIdentifier } = envVariables

const redirectUri = 'http://localhost/callback'

const keytarService = 'electron-openid-oauth'
const keytarAccount = os.userInfo().username

let accessToken
let profile
let refreshToken

const getAccessToken = () => accessToken
const getProfile = () => profile
const getAuthenticationURL = () =>
  `https://${auth0Domain}/authorize?scope=openid profile offline_access&response_type=code&client_id=${clientID}&redirect_uri=${redirectUri}`

// return the url of the v2/logout endpoint it can be used to clear user sessions 
const getLogoutUrl = () => `https://${auth0Domain}/v2/logout`

const refreshTokens = async () => {
  const refreshToken = await keytar.getPassword(keytarService, keytarAccount)

  if (refreshToken) {
    const refreshOptions = {
      method: 'POST',
      url: `https://${auth0Domain}/oauth/token`,
      header: { 'content-type': 'application/json' },
      data: {
        grant_type: 'refresh_token',
        client_id: clientID,
        refresh_token: refreshToken,
      },
    }

    try {
      const response = await axios(refreshOptions)
      accessToken = response.data.access_token
      profile = jwtDecode(response.data.id_token)
    } catch (e) {
      await logout()
      throw e
    }
  } else {
    throw new Error('No available refresh token.')
  }
}

const loadToken = async (callbackURL) => {
  const urlParts = url.parse(callbackURL, true)
  const query = urlParts.query

  const exchangeOptions = {
    grant_type: 'authorization_code',
    client_id: clientID,
    code: query.code,
    redirect_uri: redirectUri,
  }
  const options = {
    method: 'POST',
    url: `https://${auth0Domain}/oauth/token`,
    headers: {
      'content-type': 'application/json',
    },
    data: JSON.stringify(exchangeOptions),
  }

  try {
    const response = await axios(options)

    accessToken = response.data.access_token
    profile = jwtDecode(response.data.id_token)
    refreshToken = response.data.refresh_token

    if (refreshToken) {
      await keytar.setPassword(keytarService, keytarAccount, refreshToken)
    }
  } catch (e) {
    await logout()

    throw e
  }
}

// clears the local session by removing the refresh token and clearing the rest
const logout = async () => {
  await keytar.deletePassword(keytarService, keytarAccount)
  accessToken = null
  profile = null
  refreshToken = null
}

module.exports = {
  getAccessToken,
  getAuthenticationURL,
  getLogoutUrl,
  getProfile,
  loadToken,
  logout,
  refreshTokens,
}
