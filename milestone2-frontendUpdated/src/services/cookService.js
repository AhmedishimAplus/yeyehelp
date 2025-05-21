import api from '../utils/api';

export const cookService = {
  getAllCooks: () => api.get('/cooks'),
  getCookById: (id) => api.get(`/cooks/${id}`),
};
