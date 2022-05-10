import {
  GET_ANSWERS,
  ANSWER_ERROR,
  ADD_ANSWER,
  DELETE_ANSWER,
  UP_VOTE,
  DOWN_VOTE
} from './answers.types';

const initialState = {
  answers: [],
  loading: true,
  error: {},
};

export default function answers(state = initialState, action) {
  switch (action.type) {
    case GET_ANSWERS:
      return {
        ...state,
        answers: action.payload,
        loading: false,
      };
    case ADD_ANSWER:
      return {
        ...state,
        answers: [...state.answers, action.payload],
        loading: false,
      };
    case DELETE_ANSWER:
      return {
        ...state,
        answers: state.answers.filter((answer) => answer.id !== action.payload),
        loading: false,
      };
    case ANSWER_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case UP_VOTE:
      return {
        ...state,
        loading: false,
        answers: state.answers.map((answer) => {
          if(answer.id === action.payload) {
            answer.votes = (parseInt(answer.votes)+1).toString()
          }
          return answer
        })
      }
      case DOWN_VOTE:
        return {
          ...state,
          loading: false,
          answers: state.answers.map((answer) => {
            if(answer.id === action.payload) {
              answer.votes = (parseInt(answer.votes)-1).toString()
            }
            return answer
          })
        }
    default:
      return state;
  }
}
