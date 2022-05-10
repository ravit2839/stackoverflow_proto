import axios from 'axios';

import config from "../../config";
import {
  GET_USERS,
  GET_USER,
  USER_ERROR,
  GET_USERS_WITH_LOWEST_REPUTATION,
  GET_USERS_WITH_HIGHEST_REPUTATION
} from './users.types';

// Get users
export const getUsers = () => async (dispatch) => {
  try {
    const res = await axios.get(config.BASE_URL + '/api/users');
    dispatch({
      type: GET_USERS,
      payload: res.data.data,
    });
  } catch (err) {
    dispatch({
      type: USER_ERROR,
      payload: {msg: err.response.statusText, status: err.response.status},
    });
  }
};

export const getTopUsers = () => async (dispatch) => {
  try {
    const res = await axios.get(config.BASE_URL + '/api/dashboard/reputation/user/highest');
    dispatch({
      type: GET_USERS_WITH_HIGHEST_REPUTATION,
      payload: res.data.data,
    });
  } catch (err) {
    dispatch({
      type: USER_ERROR,
      payload: {msg: err.response.statusText, status: err.response.status},
    });
  }
};


export const getTopLowestUsers = () => async (dispatch) => {
  try {
    const res = await axios.get(config.BASE_URL + '/api/dashboard/reputation/user/lowest');
    dispatch({
      type: GET_USERS_WITH_LOWEST_REPUTATION,
      payload: res.data.data,
    });
  } catch (err) {
    dispatch({
      type: USER_ERROR,
      payload: {msg: err.response.statusText, status: err.response.status},
    });
  }
};


// Get user
export const getProfile = (id) => async (dispatch) => {
  try {
    const res = await axios.get(config.BASE_URL + `/api/users/${id}`);

    dispatch({
      type: GET_USER,
      payload: res.data.data,
    });
  } catch (err) {
    dispatch({
      type: USER_ERROR,
      payload: {msg: err.response.statusText, status: err.response.status},
    });
  }
};
