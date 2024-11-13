// URL del streamer a monitorear (cambia esta URL al streamer específico que deseas)
const streamerUrl = "https://kick.com/westcol";

// Crear una alarma para verificar el estado del streamer cada 1 minuto
chrome.alarms.create("checkLiveStreamer", { periodInMinutes: 1 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "checkLiveStreamer") {
    checkStreamerLiveStatus();
  }
});

function checkStreamerLiveStatus() {
  // Verificar si las notificaciones están habilitadas
  chrome.storage.sync.get("notificationsEnabled", ({ notificationsEnabled }) => {
    if (notificationsEnabled === false) {
      console.log("Las notificaciones están desactivadas.");
      return;
    }

    // Verificar si la pestaña del streamer ya está abierta
    chrome.tabs.query({ url: `${streamerUrl}*` }, (tabs) => {
      if (tabs.length > 0) {
        // Si la pestaña ya está abierta, no enviar la notificación
        console.log("La pestaña del streamer ya está abierta, no se enviará la notificación.");
        return;
      }

      // Realizar la solicitud para verificar si el streamer está en vivo
      fetch(streamerUrl)
        .then(response => response.text())
        .then(html => {
          // Verificar si el HTML contiene el indicador de "LIVE"
          const isLive = html.includes('<span class="text-grey-900 absolute -bottom-1.5 left-1/2 -translate-x-1/2 transform rounded-sm bg-green-500 px-1.5 py-1 text-[10px] font-bold capitalize leading-[1.2] lg:-bottom-1">LIVE</span>');
          
          if (isLive) {
            // Obtener la URL de la imagen de perfil del streamer usando el id "channel-avatar"
            const profileImageMatch = html.match(/<img[^>]+id="channel-avatar"[^>]+src="([^"]+)"/);
            let profileImageUrl = '../icons/west_icon.png'; // Icono predeterminado en caso de no encontrar la imagen de perfil

            if (profileImageMatch && profileImageMatch[1]) {
              profileImageUrl = profileImageMatch[1]; // URL de la imagen de perfil
            }

            // Crear la notificación con la imagen de perfil como icono
            chrome.notifications.create({
              type: "basic",
              iconUrl: profileImageUrl,
              title: "¡Westcol acaba de PRENDER!",
              message: `GOGO!! click para ver el stream YA!!`,
              priority: 2,
              requireInteraction: true
            }, (notificationId) => {
              // Guardar la información de la notificación para abrir el stream cuando se haga clic en ella
              chrome.storage.local.set({ notificationUrl: streamerUrl, notificationId });
            });
          }
        })
        .catch(err => console.error("Error al comprobar el estado del streamer:", err));
    });
  });
}

// Añadir un listener para cuando se haga clic en la notificación
chrome.notifications.onClicked.addListener((notificationId) => {
  chrome.storage.local.get(['notificationUrl', 'notificationId'], ({ notificationUrl, notificationId: storedId }) => {
    if (notificationId === storedId) {
      // Abrir la pestaña del stream al hacer clic en la notificación
      chrome.tabs.create({ url: notificationUrl });
    }
  });
});
