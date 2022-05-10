import React, {Fragment, useEffect} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import {deleteAnswer, downVote, upVote, bestAnswer} from '../../../../redux/answers/answers.actions';

import {ReactComponent as UpVote} from '../../../../assets/ArrowUpLg.svg';
import { Checkmark } from 'react-checkmark'
import {ReactComponent as DownVote} from '../../../../assets/ArrowDownLg.svg';
import {ReactComponent as SelectedUpVote} from '../../../../assets/SelectedArrowUpLg.svg';
import {ReactComponent as SelectedDownVote} from '../../../../assets/SelectedArrowDownLg.svg';
import UserCard from '../../../../components/UserCard/UserCard.component';

import './AnswerItem.styles.scss';

const AnswerItem = ({
  deleteAnswer,upVote,downVote,bestAnswer,
  answer: {body, user_id, gravatar, id, created_at, username, votes, currentUserVote},
  post: {post},
  auth,
}) => {
  body = body?.replaceAll("&lt;", "<")
  return (
    <Fragment>
      <div className='answer-layout'>
        <div className='vote-cell'>
          <div className='vote-container'>
            <button
              className='vote-up'
              title='This answer is useful'
              onClick={
                ()=>{
                  if(auth.user.id != null && currentUserVote !== 1) {
                    upVote(id, post.id)
                  }
                }
              }
            >
              {currentUserVote === 1 ? <SelectedUpVote className='icon'/> : <UpVote className='icon'/>}
            </button>
            <div className='vote-count fc-black-500'>{votes}</div>
            <button
              className='vote-down'
              title='This answer is not useful'
              onClick={
                ()=>{
                  if(auth.user.id != null && currentUserVote !== -1) {
                    downVote(id, post.id)
                  }
                }
              }
            >
              {currentUserVote === -1 ? <SelectedDownVote className='icon'/> : <DownVote className='icon' />}
            </button>
          </div>
          {post.best_answer === id && (
              <Checkmark size="medium"/>
          )}
        </div>
        <div className='answer-item'>
          <div className='answer-content fc-black-800' dangerouslySetInnerHTML={{__html: body}}>
          </div>
          <div className='answer-actions'>
            <div className='action-btns'>
              <div className='answer-menu'>
                {!auth.loading &&
                  auth.isAuthenticated &&
                  post.user_id === auth.user.id && 
                  id != post.best_answer && (
                    <Link
                      className='s-link'
                      style={{paddingRight: '4px'}}
                      title='Accept the answer'
                      onClick={(e) => bestAnswer(post.id, id)}
                      to={`/questions/${post.id}`}
                    >
                      accept
                    </Link>
                  )}
                {!auth.loading &&
                  auth.isAuthenticated &&
                  post.user_id === auth.user.id && 
                  id == post.best_answer && (
                    <Link
                      className='s-link'
                      style={{paddingRight: '4px'}}
                      title='Reject the answer'
                      onClick={(e) => bestAnswer(post.id, id)}
                      to={`/questions/${post.id}`}
                    >
                      reject
                    </Link>
                  )}
                <Link
                  className='answer-links'
                  title='short permalink to this question'
                  to='/'
                >
                  share
                </Link>
                <Link
                  className='answer-links'
                  title='Follow this question to receive notifications'
                  to='/'
                >
                  follow
                </Link>
                {!auth.loading &&
                  auth.isAuthenticated &&
                  user_id === auth.user.id && (
                    <Link
                      className='s-link s-link__danger'
                      style={{paddingLeft: '4px'}}
                      title='Delete the answer'
                      onClick={(e) => deleteAnswer(id)}
                      to={`/questions/${post.id}`}
                    >
                      delete
                    </Link>
                  )}
              </div>
            </div>
            <UserCard
              created_at={created_at}
              user_id={user_id}
              gravatar={gravatar}
              username={username}
              dateType={'answered'}
              backgroundColor={'transparent'}
            />
          </div>
        </div>
      </div>
    </Fragment>
  );
};

AnswerItem.propTypes = {
  auth: PropTypes.object.isRequired,
  post: PropTypes.object.isRequired,
  answer: PropTypes.object.isRequired,
  deleteAnswer: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
  post: state.post,
});

export default connect(mapStateToProps, {deleteAnswer,upVote,downVote,bestAnswer})(AnswerItem);
