import React, { Fragment, useEffect, useState } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { getPosts } from "../../../redux/user_profile/user_profile.actions";

import Badge from "../../../components/Badge/Badge.component";
import AnswerPanel from "./AnswerPanel.component";

import "./UserActivity.styles.scss";
import Spinner from "../../../components/Spinner/Spinner.component";
import PostItem from "../../../components/PostItem/PostItem.component";
import Pagination from "../../../components/Pagination/Pagination.component";
import LinkButton from "../../../components/LinkButton/LinkButton.component";
import ButtonGroup from "../../../components/ButtonGroup/ButtonGroup.component";
import handleSorting from "../../../services/handleSorting";
import TagPanel from "../../AllTagsPage/TagPanel/TagPanel.component";

const itemsPerPage = 2;

const UserActivity = ({
  getPosts,
  user: { user, user_loading },
  user_profile: { profiles, profile_loading },
}) => {
  useEffect(() => {
    getPosts(user.id);
  }, [getPosts, user]);

  const [page, setPage] = useState(1);
  const [tagPage, setTagPage] = useState(1);
  const [answerTage, setAnswerPage] = useState(1);
  const [sortType, setSortType] = useState("Newest");

  const handlePaginationChange = (e, value) => setPage(value);
  const handleTagPaginationChange = (e, value) => setTagPage(value);
  const handleAnswerPaginationChange = (e, value) => setAnswerPage(value);

  const userPosts = profiles["posts"]?.filter((post) => (post.user_id === user.id));
  const userTags = profiles["tags"]
  const userBadges = user.badges;
  const userAnswers = profiles["answers"]
  // console.log(user, profiles, userPosts, userTags, userBadges, userAnswers);

  return (
    <>
      {profile_loading || userPosts === null ? (
        <Spinner type="page" width="75px" height="200px" />
      ) : (
        <Fragment>
          <div className="questions-tabs">
            <span>
              {new Intl.NumberFormat("en-IN").format(userPosts.length)} questions
            </span>
            <ButtonGroup
              buttons={["Newest", "Top", "Views", "Oldest"]}
              selected={sortType}
              setSelected={setSortType}
            />
          </div>
          <div className="questions">
            {userPosts
              ?.sort(handleSorting(sortType))
              .slice(
                (page - 1) * itemsPerPage,
                (page - 1) * itemsPerPage + itemsPerPage
              )
              .map((post, index) => (
                <PostItem key={index} post={post} />
              ))}
          </div>
          {userPosts?.length > 0 && 
          <Pagination
            page={page}
            itemList={userPosts}
            itemsPerPage={itemsPerPage}
            handlePaginationChange={handlePaginationChange}
          />
          }
        </Fragment>
      )}

      {profile_loading || userTags === null ? (
        <Spinner type="page" width="75px" height="200px" />
      ) : (
        <Fragment>
          <div className="questions-tabs">
            <span>
              {new Intl.NumberFormat("en-IN").format(userTags.length)} Tags
            </span>
          </div>
          <div className="questions">
            {userTags
              ?.slice(
                (tagPage - 1) * itemsPerPage,
                (tagPage - 1) * itemsPerPage + itemsPerPage
              )
              .map((tag, index) => (
                <TagPanel key={index} tag={tag} />
              ))}
          </div>
          {userTags?.length > 0 && 
          <Pagination
            page={tagPage} 
            itemList={userTags}
            itemsPerPage={itemsPerPage}
            handlePaginationChange={handleTagPaginationChange}
          />
          }
        </Fragment>
      )}

      {profile_loading || userBadges === null ? (
        <Spinner type="page" width="75px" height="200px" />
      ) : (
        <Fragment>
          <div className="questions-tabs">
            <span>
              {new Intl.NumberFormat("en-IN").format(Object.keys(userBadges)?.length)} Badges
            </span>
          </div>
          <div className="questions">
            {Object.keys(userBadges)?.map((badge, index) => (
                <Badge
                  tag_name={badge}
                  size={'s-tag s-tag__lg'}
                  float={'left'}
                  color={userBadges[badge]?.badgeType === "GOLD" ? '#FFD700' : userBadges[badge]?.badgeType === "SILVER" ? '#C0C0C0' : '#b08d57'}
                />
              ))}
          </div>
        </Fragment>
      )}

    <br></br>

    {profile_loading || userAnswers === null ? (
        <Spinner type="page" width="75px" height="200px" />
      ) : (
        <Fragment>
          <div className="questions-tabs">
            <span>
              {new Intl.NumberFormat("en-IN").format(userAnswers.length)} Answers
            </span>
          </div>
          <div className="questions">
            {userAnswers
              ?.slice(
                (answerTage - 1) * itemsPerPage,
                (answerTage - 1) * itemsPerPage + itemsPerPage
              )
              .map((answer, index) => (
                <AnswerPanel key={index} answer={answer} />
              ))}
          </div>
          {userAnswers?.length > 0 && 
          <Pagination
            page={answerTage} 
            itemList={userAnswers}
            itemsPerPage={itemsPerPage}
            handlePaginationChange={handleAnswerPaginationChange}
          />
          }
        </Fragment>
      )}
    </>
  );
};

UserActivity.propTypes = {
  getPosts: PropTypes.func.isRequired,
  post: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  user_profile: state.user_profile,
  user: state.user,
});

export default connect(mapStateToProps, { getPosts })(UserActivity);