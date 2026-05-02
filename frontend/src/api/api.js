
const BASE_URL = "http://3.95.80.50:8000";

// ---- Auth ----
export const loginUser = async (username, password) => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  return res.json();
};

export const registerUser = async (data) => {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

// ---- Trips ----
export const getTrips = async (user_id) => {
  const res = await fetch(`${BASE_URL}/trips/?user_id=${user_id}`);
  return res.json();
};

export const createTrip = async (data) => {
  const res = await fetch(`${BASE_URL}/trips/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const joinTrip = async (user_id, join_code) => {
  const res = await fetch(`${BASE_URL}/trips/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id, join_code }),
  });
  return res.json();
};

// ---- Proposals ----
export const getProposals = async (trip_id) => {
  const res = await fetch(`${BASE_URL}/proposals/?trip_id=${trip_id}`);
  return res.json();
};

export const createProposal = async (data) => {
  const res = await fetch(`${BASE_URL}/proposals/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const updateProposalStatus = async (proposal_id, status) => {
  const res = await fetch(`${BASE_URL}/proposals/${proposal_id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  return res.json();
};

// ---- Itinerary ----
export const getItinerary = async (trip_id) => {
  const res = await fetch(`${BASE_URL}/itinerary_items/?trip_id=${trip_id}`);
  return res.json();
};

export const getItineraryItems = async (trip_id) => {
  const res = await fetch(`${BASE_URL}/itinerary_items/?trip_id=${trip_id}`);
  return res.json();
};

export const addItineraryItem = async (data) => {
  const res = await fetch(`${BASE_URL}/itinerary_items/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};
export const deleteItineraryItem = async (itemId) => {
  const res = await fetch(`${BASE_URL}/itinerary_items/${itemId}`, {
    method: "DELETE",
  });
  return res.json();
};

// ---- Trip Members ----

// export const getTripMembers = async (trip_id) => {
//   const res = await fetch(`${BASE_URL}/trip_members/?trip_id=${trip_id}`);
//   return res.json();
// };
export const getTripMembers = async (trip_id) => {
  const res = await fetch(`${BASE_URL}/trips/${trip_id}/members`);
  return res.json();
};