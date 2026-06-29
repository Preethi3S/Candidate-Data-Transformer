import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api"
});

export async function uploadCandidate({ csvFile, resumeFile, configFile }) {
  const formData = new FormData();
  if (csvFile) formData.append("csvFile", csvFile);
  if (resumeFile) formData.append("resumeFile", resumeFile);
  if (configFile) formData.append("configFile", configFile);
  const { data } = await api.post("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
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
