import {
  GET_POSTS,
  GET_POST,
  GET_TOP_POSTS,
  GET_TAG_POSTS,
  POST_ERROR,
  DELETE_POST,
  ADD_POST, UPDATE_POST, UP_VOTE, DOWN_VOTE,
} from './posts.types';

const initialState = {
  posts: [],
  post: null,
  loading: true,
  error: {},
};

export default function posts(state = initialState, action) {
  switch (action.type) {
    case GET_POSTS:
    case GET_TOP_POSTS:
    case GET_TAG_POSTS:
      return {
        ...state,
        posts: action.payload,
        loading: false,
      };
    case GET_POST:
      return {
        ...state,
        post: action.payload,
        loading: false,
      };
    case ADD_POST:
      return {
        ...state,
        posts: [action.payload, ...state.posts],
        loading: false,
      };
    case DELETE_POST:
      return {
        ...state,
        posts: state.posts.filter((post) => post.id !== action.payload),
        loading: false,
      };
    case UPDATE_POST:
      return {
        ...state,
        posts: state.posts.filter((post) => post.id !== action.payload),
        loading: false,
      };
    case POST_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case UP_VOTE:
      return {
        ...state,
        loading: false,
        posts: state.posts.map((post) => {
          if(post.id === action.payload) {
            post.votes = (parseInt(post.votes)+1).toString()
          }
          return post
        })
      }
    case DOWN_VOTE:
      return {
        ...state,
        loading: false,
        posts: state.posts.map((post) => {
          if(post.id === action.payload) {
            post.votes = (parseInt(post.votes)-1).toString()
          }
          return post
        })
      }
    default:
      return state;
  }
}
