import axios from 'axios';

import config from "../../config";
import {setAlert} from '../alert/alert.actions';
import {
    GET_PROFILE,
    PROFILE_ERROR,
} from "./user_profile.types";

// Get posts
export const getPosts = (userId) => async (dispatch) => {
  try {
    const payload = {};
    const post = await axios.get(config.BASE_URL + '/api/posts');
    
    payload["posts"] = post.data.data

    const tag = await axios.get(config.BASE_URL + `/api/users/${userId}/tags`);

    payload["tags"] = tag.data.data

    const answer = await axios.get(config.BASE_URL + `/api/users/${userId}/answers`);

    payload["answers"] = answer.data.data

    dispatch({
      type: GET_PROFILE,
      payload: payload,
    });
  } catch (err) {
    dispatch(setAlert(err.response.data.message, 'danger'));

    dispatch({
      type: PROFILE_ERROR,
      payload: {msg: err.response.statusText, status: err.response.status},
    });
  }
};
