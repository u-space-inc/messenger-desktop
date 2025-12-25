// Preload script for Messenger Desktop
// This script runs in the renderer process before the web page loads

const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Platform info
  platform: process.platform,
  
  // Notification support check
  notificationsSupported: () => {
    return 'Notification' in window;
  },
});

// Log when preload is ready
console.log('Messenger Desktop: Preload script loaded');

// Override notification permission to always be granted
// This helps with Messenger's built-in notification system
window.addEventListener('DOMContentLoaded', () => {
  // Messenger uses web notifications, so we ensure they work
  if ('Notification' in window) {
    // Request permission if not already granted
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }
});
