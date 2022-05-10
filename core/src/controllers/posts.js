const { request } = require('express');
const { validationResult } = require('express-validator');
const {
  responseHandler,
  asyncHandler
} = require('../helpers');
const { Post } = require('../models');
const { Vote } = require('../models/vote');
const { postsService } = require('../services');

exports.getPosts = asyncHandler(async (req, res) => {
  try {
    await postsService.retrieveAll((err, data) => {
      if (err) {
        console.log(err);
        return res.status(err.code)
          .json(err);
      }

      return res.status(data.code)
        .json(data);
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json(responseHandler(true, 500, 'Server Error', null));
  }
});

exports.getTagPosts = asyncHandler(async (req, res) => {
  const tagName = req.params.tagname;

  try {
    await postsService.retrieveAllTag(
      tagName,
      (err, data) => {
        if (err) {
          console.log(err);
          return res.status(err.code)
            .json(err);
        }
        return res.status(data.code)
          .json(data);
      },
    );
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json(responseHandler(true, 500, 'Server Error', null));
  }
});

exports.getSinglePost = asyncHandler(async (req, res) => {
  try {
    await postsService.retrieveOne({postId: req.params.id, userId: req.user?.id ?? null}, (err, data) => {
      if (err) {
        console.log(err);
        return res.status(err.code)
          .json(err);
      }
      return res.status(data.code)
        .json(data);
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json(responseHandler(false, 500, 'Server Error', null));
  }
});

exports.addPost = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json(responseHandler(false, 400, errors.array()[0].msg, null));
  }
  try {
    const post = new Post({
      title: req.body.title,
      body: req.body.body,
      userId: req.user.id,
      tagName: req.body.tagname,
      images: req.body.images,
      status: req.body.status,
    });
    // Save Post in the database
    await postsService.create(post, (err, data) => {
      if (err) {
        console.log(err);
        return res.status(err.code)
          .json(err);
      }
      return res.status(data.code)
        .json(data);
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json(responseHandler(false, 500, 'Server Error', null));
  }
});

exports.deletePost = asyncHandler(async (req, res) => {
  try {
    await postsService.remove(req.params.id, (err, data) => {
      if (err) {
        console.log(err);
        return res.status(err.code)
          .json(err);
      }
      return res.status(data.code)
        .json(data);
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json(responseHandler(false, 500, 'Server Error', null));
  }
});

exports.patchPost = asyncHandler(async (req, res) => {
  try {
    await postsService.patch(req.params.id, req.body, (err, data) => {
      if (err) {
        console.log(err);
        return res.status(err.code)
          .json(err);
      }
      return res.status(data.code)
        .json(data);
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json(responseHandler(false, 500, 'Server Error', null));
  }
});

exports.bestAnswer = asyncHandler(async (req, res) => {
  try {
    const postId = req.params.id
    const answerId = req.body.answerId
    // console.log(postId, answerId)
    // Save Post in the database
    await postsService.bestAnswer(postId, answerId, (err, data) => {
      if (err) {
        console.log(err);
        return res.status(err.code).json(err);
      }
      return res.status(data.code).json(data);
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json(responseHandler(false, 500, 'Server Error', null));
  }
});

exports.addVote = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json(responseHandler(false, 400, errors.array()[0].msg, null));
  }
  try {
    const vote = new Vote({
      voteType : req.body.voteType,
      userId : req.user.id,
      postId : req.params.id
    })
    await postsService.addVote(vote, (err, data) => {
      if (err) {
        console.log(err);
        return res.status(err.code).json(err);
      }
      return res.status(data.code).json(data);
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json(responseHandler(false, 500, 'Server Error', null));
  }
})
