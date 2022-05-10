import React, { Fragment } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { downVote, upVote } from "../../../../redux/posts/posts.actions";

import { ReactComponent as UpVote } from "../../../../assets/ArrowUpLg.svg";
import { ReactComponent as DownVote } from "../../../../assets/ArrowDownLg.svg";
import { ReactComponent as SelectedUpVote } from "../../../../assets/SelectedArrowUpLg.svg";
import { ReactComponent as SelectedDownVote } from "../../../../assets/SelectedArrowDownLg.svg";

import "./VoteCell.styles.scss";

const VoteCell = ({
  upVote,
  downVote,
  answerCount,
  commentCount,
  tagCount,
  post: { post },
  auth,
}) => {
  return (
    <Fragment>
      <div className="vote-cell fc-black-800">
        <div className="vote-container">
          <button
            className="vote-up"
            title="This answer is useful"
            onClick={() => {
              if (auth.user.id != null && post.currentUserVote !== 1) {
                upVote(post.id);
              }
            }}
          >
            {post.currentUserVote === 1 ? (
              <SelectedUpVote className="icon" />
            ) : (
              <UpVote className="icon" />
            )}
          </button>
          <div className="vote-count fc-black-500">{post.votes}</div>
          <button
            className="vote-down"
            title="This answer is not useful"
            onClick={() => {
              if (auth.user.id != null && post.currentUserVote !== -1) {
                downVote(post.id);
              }
            }}
          >
            {post.currentUserVote === -1 ? (
              <SelectedDownVote className="icon" />
            ) : (
              <DownVote className="icon" />
            )}
          </button>
        </div>
        <div className="stats">
          <div className="vote">
            <span className="vote-count">{answerCount}</span>
            <div className="count-text">answers</div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

VoteCell.propTypes = {
  auth: PropTypes.object.isRequired,
  post: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
  post: state.post,
});

export default connect(mapStateToProps, { upVote, downVote })(VoteCell);
