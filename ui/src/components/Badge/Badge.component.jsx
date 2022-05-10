import { color } from "@mui/system";
import React, { Fragment } from "react";
import { Link } from "react-router-dom";
import { FaTrophy } from "react-icons/fa";

import "./Badge.styles.scss";

const Badge = ({tag_name, size, display, float, color}) => {
    return (
      <Fragment>
        <div className='tags-badge' style={{display, float}}>
          <div className={`${size}`}>
          <FaTrophy style={{color}}/> &nbsp;
            {tag_name}
          </div>
        </div>
      </Fragment>
    );
  };

export default Badge;
