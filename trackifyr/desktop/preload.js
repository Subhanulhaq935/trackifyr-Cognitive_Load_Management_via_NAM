const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('trackifyr', {
  getConfig: () => ipcRenderer.invoke('trackifyr:config'),
  setContentSize: (payload) => ipcRenderer.invoke('trackifyr:setContentSize', payload),
  signin: (payload) => ipcRenderer.invoke('trackifyr:signin', payload),
  me: (payload) => ipcRenderer.invoke('trackifyr:me', payload),
  signout: (payload) => ipcRenderer.invoke('trackifyr:signout', payload),
})
