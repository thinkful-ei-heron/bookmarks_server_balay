const path = require('path');
const express = require('express');
const xss = require('xss');
const BookmarksService = require('./BookmarksService');

const bookmarksRouter = express.Router();
const jsonParser = express.json();

const serializeBookmark = bookmark => ({
  id: bookmark.id,
  title: xss(bookmark.title),
  url: bookmark.url,
  description: xss(bookmark.description),
  rating: bookmark.rating,
});


bookmarksRouter
  .route('/api/bookmarks')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db');
    BookmarksService.getAllBookmarks(knexInstance)
      .then(bookmarks => {
        res.json(bookmarks.map(serializeBookmark));
      })
      .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    const { title, url, description, rating } = req.body;
    const newBookmark = { title, url, description, rating };
    const requiredFields = { title, url, rating };

    for (const [key, value] of Object.entries(requiredFields)) {
      if (value == null) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        });
      }
    }

    
    BookmarksService.insertBookmark(
      req.app.get('db'),
      newBookmark
    )
      .then(bookmark => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${bookmark.id}`))
          .json(serializeBookmark(bookmark));
      })
      .catch(next);
  });
 


bookmarksRouter
  .route('/api/bookmarks/:bookmarkId')
  .all((req, res, next) => {
    BookmarksService.getById(
      req.app.get('db'),
      req.params.bookmarkId
    )
      .then(bookmark => {
        if (!bookmark) {
          return res.status(404).json({
            error: { message: 'Bookmark doesn\'t exist' }
          });
        }
        res.bookmark = bookmark;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    res.json(serializeBookmark(res.bookmark));
  })
  .delete((req, res, next) => {
    BookmarksService.deleteBookmark(
      req.app.get('db'),
      req.params.bookmarkId
    )
      .then(() => {
        res.status(204).end();
      })
      .catch(next);
  })
  .patch(jsonParser, (req, res, next) => {
    const { title, url, description, rating } = req.body;
    const bookmarkToUpdate = { title, url, description, rating };
    const requiredFields = { title, url, rating };

    const numberOfValues = Object.values(requiredFields).filter(Boolean).length;
    if (numberOfValues === 0) {
      return res.status(400).json({
        error: { message: `Request body must contain either 'title', 'url', or 'rating'` }
      });
    }

    BookmarksService.updateBookmark(
      req.app.get('db'),
      req.params.bookmarkId,
      bookmarkToUpdate
    )
      .then(numRowsAffected => {
        res.status(204).end();
      })
      .catch(next);
  });


module.exports = bookmarksRouter;