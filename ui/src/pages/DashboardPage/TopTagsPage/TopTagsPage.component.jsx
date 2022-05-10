import React, {useEffect, Fragment, useState} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {getTags} from '../../../redux/tags/tags.actions';
import handleSorting from '../../../services/handleSorting';

import TagPanel from './../../AllTagsPage/TagPanel/TagPanel.component';
import Spinner from '../../../components/Spinner/Spinner.component';
import SearchBox from '../../../components/SearchBox/SearchBox.component';
import ButtonGroup from '../../../components/ButtonGroup/ButtonGroup.component';
import Pagination from "../../../components/Pagination/Pagination.component";

import './TopTagsPage.styles.scss';

const itemsPerPage = 10;

const TopTagsPage = ({getTags, tag: {tags, loading}}) => {
  useEffect(() => {
    getTags();
  }, [getTags]);

  const [page, setPage] = useState(1);
  const [fetchSearch, setSearch] = useState('');
  const [sortType, setSortType] = useState('Popular');

  const handleChange = (e) => {
    e.preventDefault();
    setSearch(e.target.value);
    setPage(1)
  };

  const handlePaginationChange = (e, value) => setPage(value);

  return loading || tags === null ? (
    <Spinner type='page' width='75px' height='200px' />
  ) : (
    <Fragment>
      <div id='mainbar1' className='tags-page fc-black-800'>
        <h1 className='headline'>Top 10 Most Used Tags</h1>

        <div className='user-browser'>
          <div className='grid-layout'>
            {tags
              .filter((tag) =>
                tag.tagname.toLowerCase().includes(fetchSearch.toLowerCase())
              )
              ?.sort(handleSorting(sortType))
              .slice((page - 1) * itemsPerPage, (page - 1) * itemsPerPage + itemsPerPage)
              .map((tag, index) => (
                <TagPanel key={index} tag={tag} />
              ))}
          </div>
        </div>

      </div>
    </Fragment>
  );
};

TopTagsPage.propTypes = {
  getTags: PropTypes.func.isRequired,
  tag: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  tag: state.tag,
});

export default connect(mapStateToProps, {getTags})(TopTagsPage);
