import {
  GET_PROFILE,
  GET_USER,
  USER_ERROR,
} from "./user_profile.types";

const initialState = {
  profiles: {},
  profile_loading: true,
  user: null,
  user_loading: true,
  error: {},
};

export default function user_profile(state = initialState, action) {
  switch (action.type) {
    case GET_PROFILE:
      return {
        ...state,
        profiles: action.payload,
        profile_loading: false,
      };
    case GET_USER:
    case USER_ERROR:
      return {
        ...state,
        error: action.payload,
        user_loading: false,
      };
    default:
      return state;
  }
}
