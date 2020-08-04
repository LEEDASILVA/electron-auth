# auth electron

dependencies:

- axios
- jwt-decode
- electron
- keytar (node module to get, add, replace and delete passwords in system Keychain):
  - linux -> secret api/libsecret
  - windows -> credencial vault

External applications

- manage.auth0.com

Remember that Electron has two types of processes: the main process and the renderer process.
The main process is unique to each application and is the only process that can call the native Electron API.
The renderer process is responsible for running each web page in the application.

security part:

- https://www.electronjs.org/docs/tutorial/security#checklist-security-recommendations
