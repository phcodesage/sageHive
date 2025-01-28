// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  sendRequest: async (method, url, headers, body, params) => {
    try {
      const response = await ipcRenderer.invoke('send-request', {
        method,
        url,
        headers,
        body,
        params
      });
      return response;
    } catch (error) {
      throw error;
    }
  },
  saveRequest: (requestData) => {
    return ipcRenderer.invoke('save-request', requestData);
  },
  loadRequests: () => {
    return ipcRenderer.invoke('load-requests');
  }
});
