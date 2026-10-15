/**
 * Vent Space Service
 *
 * Frontend-facing service layer.
 *
 * Replace the mock implementations below with your
 * actual backend/API/WebSocket implementation.
 *
 * Vent Space is designed around temporary interactions.
 * Do not introduce persistent conversation storage here
 * unless the product privacy model explicitly changes.
 */

/**
 * Find a random compatible conversation partner.
 *
 * @param {Object} preferences
 * @returns {Promise<Object>}
 */
export const findVentMatch = async (preferences) => {
  /*
 Example future implementation:

 const response = await fetch("/api/vent/match", {
 method: "POST",
 headers: {
 "Content-Type": "application/json",
 },
 body: JSON.stringify(preferences),
 });

 if (!response.ok) {
 throw new Error("Unable to find a match.");
 }

 return response.json();
 */

  return {
    sessionId: `mock-${Date.now()}`,
    status: "matched",
    partner: {
      anonymous: true,
    },
  };
};

/**
 * Find a listener.
 */
export const findListenerMatch = async () => {
  /*
 Replace with backend matching endpoint.
 */

  return {
    sessionId: `listener-${Date.now()}`,
    status: "matched",
    partner: {
      anonymous: true,
      role: "listener",
    },
  };
};

/**
 * Send a message through an active Vent session.
 *
 * This should eventually communicate through your
 * real-time transport layer, such as WebSocket/WebRTC
 * or another appropriate service.
 */
export const sendVentMessage = async (sessionId, message) => {
  if (!sessionId) {
    throw new Error("Vent session is required.");
  }

  if (!message?.trim()) {
    throw new Error("Message cannot be empty.");
  }

  /*
 Example:

 socket.send(
 JSON.stringify({
 type: "message",
 sessionId,
 message,
 })
 );
 */

  return {
    success: true,
    sessionId,
    message,
  };
};

/**
 * End an active Vent session.
 */
export const endVentSession = async (sessionId) => {
  if (!sessionId) {
    return;
  }

  /*
 Backend should invalidate the session.

 Any temporary session state should be cleaned up
 according to the privacy architecture.
 */

  return {
    success: true,
    sessionId,
  };
};

/**
 * Report a user/session.
 */
export const reportVentSession = async (sessionId, reason) => {
  if (!sessionId) {
    throw new Error("Vent session is required.");
  }

  return {
    success: true,
    sessionId,
    reason,
  };
};

/**
 * Leave a conversation.
 */
export const leaveVentSession = async (sessionId) => {
  return endVentSession(sessionId);
};
