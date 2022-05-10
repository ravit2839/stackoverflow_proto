import {
  GET_USERS,
  GET_USER,
  USER_ERROR,
  GET_USERS_WITH_HIGHEST_REPUTATION,
  GET_USERS_WITH_LOWEST_REPUTATION
} from './users.types';

const initialState = {
  users: [],
  user: null,
  loading: true,
  error: {},
};

export default function users(state = initialState, action) {
  switch (action.type) {
    case GET_USERS:
      return {
        ...state,
        users: action.payload,
        loading: false,
      };
    case GET_USERS_WITH_HIGHEST_REPUTATION:
      return {
        ...state,
        users: action.payload,
        loading: false,
      };
    case GET_USERS_WITH_LOWEST_REPUTATION:
      return {
        ...state,
        users: action.payload,
        loading: false,
      };
    case GET_USER:
      return {
        ...state,
        user: action.payload,
        loading: false,
      };
    case USER_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    default:
      return state;
  }
}