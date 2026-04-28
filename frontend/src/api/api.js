const BASE_URL = "http://localhost:8005";

export const getUsers = async () => {
  const res = await fetch(`${BASE_URL}/users-raw`);
  return res.json();
};