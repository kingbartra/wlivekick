document.addEventListener("DOMContentLoaded", () => {
    const toggleNotifications = document.getElementById("toggleNotifications");
  
    // Cargar el estado del checkbox de almacenamiento
    chrome.storage.sync.get("notificationsEnabled", ({ notificationsEnabled }) => {
      toggleNotifications.checked = notificationsEnabled !== false; // Por defecto está activo
    });
  
    // Cambiar el estado de las notificaciones según el checkbox
    toggleNotifications.addEventListener("change", () => {
      chrome.storage.sync.set({ notificationsEnabled: toggleNotifications.checked });
    });
  });
  