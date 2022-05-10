import React, {Fragment, useEffect, useState} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {getTopLowestUsers} from '../../../redux/users/users.actions';
import handleSorting from '../../../services/handleSorting';

import UserPanel from './../../AllUsersPage/UserPanel/UserPanel.component';
import Spinner from '../../../components/Spinner/Spinner.component';
import Pagination from "../../../components/Pagination/Pagination.component";

import './TopLowestUser.styles.scss';

const itemsPerPage = 16;

const TopLowestUser = ({getTopLowestUsers, user: {users, loading}}) => {
  useEffect(() => {
    getTopLowestUsers();
  }, [getTopLowestUsers]);

  const [page, setPage] = useState(1);
  const [fetchSearch, setSearch] = useState('');
  const [sortType, setSortType] = useState('Popular');

  const handlePaginationChange = (e, value) => setPage(value);


  return loading || users === null ? (
    <Spinner type='page' width='75px' height='200px' />
  ) : (
    <Fragment>
      <div className='users-page'>
        <h1 className='headline'>Top 10 Users with Lowest Reputation</h1>
        <div className='user-browser'>
          <div className='grid-layout'>
            {users
              .filter((user) =>
                user.username.toLowerCase().includes(fetchSearch.toLowerCase())
              )
              ?.sort(handleSorting(sortType, 'users'))
              .slice((page - 1) * itemsPerPage, (page - 1) * itemsPerPage + itemsPerPage)
              .map((user, index) => (
                <UserPanel key={index} user={user} />
              ))}
          </div>
        </div>
      </div>
    </Fragment>
  );
};

TopLowestUser.propTypes = {
  getTopLowestUsers: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  user: state.user,
});

export default connect(mapStateToProps, { getTopLowestUsers })(TopLowestUser);
