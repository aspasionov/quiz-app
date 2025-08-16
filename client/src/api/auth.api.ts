import api from '@/api/base.api';
import type { User } from '@/types';
import useUserStore from '@/stores/useUserStore';


const setCredentials = (user: {token: string} & User) => {
  const { setUser } = useUserStore.getState();
  const {token, ...userData} = user;
  setUser(userData);
  if(token) localStorage.setItem('token', token);
}

export const registerUser = async (data: User) => {
  const response = await api.post('auth/register', data);
  setCredentials(response.data);
  return response.data;
};

export const loginUser = async (email: string, password: string) => {
  const response = await api.post('auth/login', { email, password });
  // Server returns data directly with token included
  setCredentials(response.data);
  return response.data;
};

export const getUser = async () => {
  const response = await api.get('auth/me');
  setCredentials(response.data);
  return response.data;
};
