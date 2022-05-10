import React, {Fragment, useEffect, useState} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';

import {getPosts} from '../../../redux/posts/posts.actions';
import LinkButton from '../../../components/LinkButton/LinkButton.component';
import PostItem from '../../../components/PostItem/PostItem.component';
import Spinner from '../../../components/Spinner/Spinner.component';
import handleSorting from "../../../services/handleSorting";
import Pagination from "../../../components/Pagination/Pagination.component";

import './TopQuestion.styles.scss';

const itemsPerPage = 3;

const TopQuestion = ({getPosts, post: {posts, loading}}) => {
  useEffect(() => {
    getPosts();
  }, [getPosts]);

  const [page, setPage] = useState(1);

  const handlePaginationChange = (e, value) => setPage(value);

  return loading || posts === null ? (
    <Spinner type='page' width='75px' height='200px' />
  ) : (
    <Fragment>
      <div>
        <div className='questions-grid'>
          <h3 className='questions-headline'>Top 10 Questions</h3>
        </div>
        <div className='questions-tabs'>
          <span>
            {new Intl.NumberFormat('en-IN').format(posts.length)} questions
          </span>
        </div>
        <div className="questions">
          {posts
            .sort(handleSorting('Top'))
            .slice((page - 1) * itemsPerPage, (page - 1) * itemsPerPage + itemsPerPage)
            .map((post, index) => (
            <PostItem key={index} post={post} />
          ))}
        </div>
        <Pagination
          page={page}
          itemList={posts}
          itemsPerPage={itemsPerPage}
          handlePaginationChange={handlePaginationChange}
        />
      </div>
    </Fragment>
  );
};

TopQuestion.propTypes = {
  getPosts: PropTypes.func.isRequired,
  post: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  post: state.post,
});

export default connect(mapStateToProps, { getPosts })(TopQuestion);
