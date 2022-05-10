import React from "react";
import moment from "moment";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";

const AnswerPanel = ({ answer: { body, post_id, created_at } }) => {
  body = body?.replaceAll("&lt;", "<");
  return (
    <div className="grid--item s-card js-tag-cell d-flex fd-column">
      <div className="d-flex jc-pspace-between ai-center mb12">
        <Link to={`/questions/${post_id}`}>
          <div
            className=""
            dangerouslySetInnerHTML={{ __html: body }}
          ></div>
        </Link>
      </div>

      <div className="mt-auto d-flex jc-space-between fs-caption fc-black-400">
        <div className="flex--item s-anchors s-anchors__inherit">
          added {moment(created_at).fromNow(false)}
        </div>
      </div>
    </div>
  );
};

AnswerPanel.propTypes = {
  tag: PropTypes.object.isRequired,
};

export default connect(null)(AnswerPanel);
