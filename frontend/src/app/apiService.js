import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
});

export const getSleepCondition = async () => {
  const response = await api.get('/sleep-condition/');
  return response.data;
};

export const getStepsCondition = async () => {
  const response = await api.get('/steps-condition/');
  return response.data;
};

export const getStepsComparison = async () => {
  const response = await api.get('/steps-comparison/');
  return response.data;
};