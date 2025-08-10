import axios from 'axios';
import useSnackBarStore from '@/stores/useSnackBarStore';

const fallbackMessage = 'Something went wrong';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
  // withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const { showSnackbar } = useSnackBarStore.getState();

    if (status === 400) {
      const errors = error.response?.data?.errors.map(Object.values)?.join(', ');
      showSnackbar(errors || fallbackMessage, 'error');
    }

    if (status === 403) {

    }

    if (status === 500) {

    }


    return Promise.reject(error);
  }
);

export default api;
