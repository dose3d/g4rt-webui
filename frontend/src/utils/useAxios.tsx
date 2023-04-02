import axios from 'axios';
import jwt_decode from 'jwt-decode';
import dayjs from 'moment';
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

const useAxios = () => {
  const { authTokens, setUser, setAuthTokens } = useContext(AuthContext);

  const axiosInstance = axios.create({
    headers: { Authorization: `Bearer ${authTokens?.access}` },
  });

  axiosInstance.interceptors.request.use(async (req) => {
    if (!authTokens) {
      return req;
    }

    const user = jwt_decode(authTokens.access) as { exp: number };
    const isExpired = dayjs.unix(user.exp).diff(dayjs()) < 1;

    if (!isExpired) {
      return req;
    }

    const response = await axios.post(`/api/token/refresh/`, {
      refresh: authTokens.refresh,
    });

    localStorage.setItem('authTokens', JSON.stringify(response.data));

    setAuthTokens(response.data);
    setUser(jwt_decode(response.data.access));

    req.headers.Authorization = `Bearer ${response.data.access}`;
    return req;
  });

  return axiosInstance;
};

export default useAxios;
