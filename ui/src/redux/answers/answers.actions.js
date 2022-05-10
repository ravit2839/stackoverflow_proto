import {
  GET_ANSWERS,
  ANSWER_ERROR,
  ADD_ANSWER,
  DELETE_ANSWER,
  UP_VOTE,
  DOWN_VOTE,
} from './answers.types';

import axios from 'axios';
import {setAlert} from '../alert/alert.actions';
import config from "../../config";
import {getPost} from "../posts/posts.actions"

export const getAnswers = (id) => async (dispatch) => {
  try {
    const res = await axios.get(config.BASE_URL + `/api/posts/answers/${id}`);

    dispatch({
      type: GET_ANSWERS,
      payload: res.data.data,
    });
  } catch (err) {
    dispatch({
      type: ANSWER_ERROR,
      payload: {msg: err.response.statusText, status: err.response.status},
    });
  }
};

// Add Answer
export const addAnswer = (postId, formData) => async (dispatch) => {
  const config_headers = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  try {
    const res = await axios.post(
      config.BASE_URL + `/api/posts/answers/${postId}`,
      formData,
      config_headers
    );

    dispatch({
      type: ADD_ANSWER,
      payload: res.data.data,
    });

    dispatch(setAlert(res.data.message, 'success'));

    dispatch(getAnswers(postId));
  } catch (err) {
    dispatch(setAlert(err.response.data.message, 'danger'));

    dispatch({
      type: ANSWER_ERROR,
      payload: {msg: err.response.statusText, status: err.response.status},
    });
  }
};

// Delete Answer
export const deleteAnswer = (AnswerId) => async (dispatch) => {
  try {
    const res = await axios.delete(config.BASE_URL + `/api/posts/answers/${AnswerId}`);

    dispatch({
      type: DELETE_ANSWER,
      payload: AnswerId,
    });

  } catch (err) {
    dispatch(setAlert(err.response.data.message, 'danger'));

    dispatch({
      type: ANSWER_ERROR,
      payload: {msg: err.response.statusText, status: err.response.status},
    });
  }
};

export const upVote = (AnswerId, postId) => async (dispatch) => {
  const config_headers = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  try {
    const res = await axios.post(
      config.BASE_URL + `/api/posts/answers/vote/${AnswerId}`,
      {voteType: 1},
      config_headers
    );

    dispatch({
      type: UP_VOTE,
      payload: AnswerId,
    });

    dispatch(getPost(postId))

  } catch (err) {
    dispatch(setAlert(err.response.data.message, 'danger'));

    dispatch({
      type: ANSWER_ERROR,
      payload: {msg: err.response.statusText, status: err.response.status},
    });
  }

};


export const downVote = (AnswerId, postId) => async (dispatch) => {
  const config_headers = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  try {
    const res = await axios.post(
      config.BASE_URL + `/api/posts/answers/vote/${AnswerId}`,
      {voteType: -1},
      config_headers
    );

    dispatch({
      type: DOWN_VOTE,
      payload: AnswerId,
    });
    dispatch(getPost(postId))
    dispatch(setAlert(res.data.message, 'success'));

  } catch (err) {
    dispatch(setAlert(err.response.data.message, 'danger'));

    dispatch({
      type: ANSWER_ERROR,
      payload: {msg: err.response.statusText, status: err.response.status},
    });
  }

};


export const bestAnswer = (postId, answerId) => async (dispatch) => {
  try {
    const post = await axios.get(config.BASE_URL + `/api/posts/${postId}`);

    // console.log(post.data.data.best_answer, answerId)
    if (post.data.data.best_answer == answerId) {
      answerId = null
    }

    const res = await axios.patch(config.BASE_URL + `/api/posts/${postId}`, {
      "answerId": answerId
    });

    dispatch(getPost(postId));

    if (answerId == null) {
      dispatch(setAlert("Answer Rejected", 'success'));
    } else {
      dispatch(setAlert("Answer Accepted", 'success'));
    }
  } catch (err) {
    dispatch(setAlert(err.response.data.message, 'danger'));

    dispatch({
      type: ANSWER_ERROR,
      payload: {msg: err.response.statusText, status: err.response.status},
    });
  }
}