import React, {Fragment, useEffect, useState} from 'react';

import './DashboardPage.styles.scss';
import TopQuestion from './TopQuestions/TopQuestion.component';
import TopUser from './TopUser/TopUser.component';
import TopLowestUser from './TopUser/TopLowestUser.component';
import TopTagsPage from './TopTagsPage/TopTagsPage.component';

const DashboardPage = () => {
  return (
    <Fragment>
      <div id='mainbar' className='homepage'>
      <TopLowestUser/>
      <TopUser/>
      <TopTagsPage/>
      <TopQuestion/>
    </div>
    </Fragment>);
};

export default DashboardPage;
