import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api"
});

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

export async function signup(payload) {
  const { data } = await api.post("/auth/signup", payload);
  return data;
}

export async function signin(payload) {
  const { data } = await api.post("/auth/signin", payload);
  return data;
}

export async function fetchMe() {
  const { data } = await api.get("/auth/me");
  return data.user;
}

export async function logoutSession() {
  const { data } = await api.post("/auth/logout");
  return data;
}

export async function uploadCandidate({ csvFile, resumeFile, configFile, atsFile, linkedinFile, githubFile, atsJson, linkedinJson, githubJson }) {
  const formData = new FormData();
  if (csvFile) formData.append("csvFile", csvFile);
  if (resumeFile) formData.append("resumeFile", resumeFile);
  if (atsFile) formData.append("atsFile", atsFile);
  if (linkedinFile) formData.append("linkedinFile", linkedinFile);
  if (githubFile) formData.append("githubFile", githubFile);
  if (configFile) formData.append("configFile", configFile);
  if (atsJson) formData.append("atsJson", atsJson);
  if (linkedinJson) formData.append("linkedinJson", linkedinJson);
  if (githubJson) formData.append("githubJson", githubJson);
  const { data } = await api.post("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return data;
}

export async function processDemoDataset() {
  const { data } = await api.post("/demo/process");
  return data;
}

export async function getProfiles() {
  const { data } = await api.get("/profiles");
  return data.candidates;
}

export async function rerunProjection(candidateId, config) {
  const { data } = await api.post(`/profile/${candidateId}/project`, { config });
  return data;
}

export { api };


