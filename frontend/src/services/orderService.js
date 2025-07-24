import axios from 'axios';
import { backendUrl } from '../App';

export const placeOrder = async (orderData) => {
  return axios.post(`${backendUrl}/api/order/place`, orderData);
};

export const getUserOrders = async (userID) => {
  return axios.get(`${backendUrl}/api/order/user/${userID}`);
};

export const getAllOrders = async () => {
  return axios.get(`${backendUrl}/api/order/all`);
};

export const updateOrderStatus = async (orderID, status) => {
  return axios.put(`${backendUrl}/api/order/status/${orderID}`, { status });
};

export const updateOrderDetails = async (orderID, details) => {
  return axios.put(`${backendUrl}/api/order/details/${orderID}`, details);
}; 