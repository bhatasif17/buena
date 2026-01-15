const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const UPLOADS_BASE = import.meta.env.VITE_UPLOADS_URL || 'http://localhost:3001/uploads';

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function handleResponse(response) {
  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      data.error?.message || data.message || 'Request failed',
      response.status
    );
  }

  return data.data !== undefined ? data.data : data;
}

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, options);
  return handleResponse(response);
}

// Properties
export async function fetchProperties() {
  return request('/properties');
}

export async function fetchProperty(id) {
  return request(`/properties/${id}`);
}

export async function createProperty(formData) {
  return request('/properties', {
    method: 'POST',
    body: formData,
  });
}

export async function updateProperty(id, data) {
  return request(`/properties/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function deleteProperty(id) {
  const response = await fetch(`${API_BASE}/properties/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const data = await response.json();
    throw new ApiError(
      data.error?.message || 'Failed to delete property',
      response.status
    );
  }
}

// Buildings
export async function fetchBuildings(propertyId) {
  return request(`/properties/${propertyId}/buildings`);
}

export async function createBuilding(propertyId, data) {
  return request(`/properties/${propertyId}/buildings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function updateBuilding(id, data) {
  return request(`/buildings/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function deleteBuilding(id) {
  const response = await fetch(`${API_BASE}/buildings/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const data = await response.json();
    throw new ApiError(
      data.error?.message || 'Failed to delete building',
      response.status
    );
  }
}

// Units
export async function fetchUnits(buildingId) {
  return request(`/buildings/${buildingId}/units`);
}

export async function createUnit(buildingId, data) {
  return request(`/buildings/${buildingId}/units`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function createUnitsBulk(buildingId, units) {
  return request(`/buildings/${buildingId}/units/bulk`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ units }),
  });
}

export async function updateUnit(id, data) {
  return request(`/units/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function deleteUnit(id) {
  const response = await fetch(`${API_BASE}/units/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const data = await response.json();
    throw new ApiError(
      data.error?.message || 'Failed to delete unit',
      response.status
    );
  }
}

// Suggestions
export async function fetchStaffSuggestions() {
  return request('/suggestions/staff');
}

// Utilities
export function getUploadUrl(filename) {
  return `${UPLOADS_BASE}/${filename}`;
}

export { ApiError };
