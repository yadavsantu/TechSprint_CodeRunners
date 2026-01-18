module.exports = (socket, io) => {
  // Join a zone
  socket.on("join-ambulance-zone", ({ zoneId }) => {
    socket.join(`zone-${zoneId}`);
    console.log(`Ambulance joined zone-${zoneId}`);
  });

  // Ambulance goes online
  socket.on("ambulance-online", ({ ambulanceId }) => {
    socket.join(`ambulance-${ambulanceId}`);
    console.log(`Ambulance ${ambulanceId} is now online`);
  });

  // Ambulance goes offline
  socket.on("ambulance-offline", ({ ambulanceId }) => {
    socket.leave(`ambulance-${ambulanceId}`);
    console.log(`Ambulance ${ambulanceId} is now offline`);
  });

  // ✅ ACCEPT ACCIDENT (FIXED)
  socket.on("accept-accident", ({ accidentId }) => {
    const driverId = socket.user?._id;

    console.log(`Accident ${accidentId} accepted by ${driverId}`);

    // 🔥 Remove accident for ALL OTHER drivers
    socket.broadcast.emit("remove-accident", {
      accidentId,
    });

    // (Optional but recommended)
    // Update DB here: mark accident as ASSIGNED
  });
};
