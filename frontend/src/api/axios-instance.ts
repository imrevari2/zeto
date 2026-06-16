import axios from 'axios';
  import type { AxiosRequestConfig } from 'axios'

  const instance = axios.create({
    baseURL: 'http://localhost:8080',
  });

  export const customAxios = <T>(config: AxiosRequestConfig): Promise<T> =>
    instance(config).then((res) => res.data);