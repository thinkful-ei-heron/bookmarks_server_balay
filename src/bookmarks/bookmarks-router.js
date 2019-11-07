const express = require('express');
const BookmarksService = require('../BookmarksService');

const bookmarksRouter = express.Router();


bookmarksRouter
  .route('/bookmarks')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db');
    BookmarksService.getAllBookmarks(knexInstance)
      .then(bookmarks => {
        res.json(bookmarks);
      })
      .catch(next);
  });
// .post(bodyParser, (req, res) => {
//   const { title, url, description, rating } = req.body;

//   if (!title) {
//     logger.error('Title is required');
//     return res
//       .status(400)
//       .send('Invalid data');
//   }

//   if (!url) {
//     logger.error('URL is required');
//     return res
//       .status(400)
//       .send('Invalid data');
//   }

//   if (!rating) {
//     logger.error('Rating is required');
//     return res
//       .status(400)
//       .send('Invalid data');
//   }

//   const id = uuid();

//   const bookmark = {
//     id,
//     title,
//     url,
//     description,
//     rating
//   };

//   bookmarks.push(bookmark);

//   logger.info(`Bookmark with id ${bookmark.id} created`);

//   res
//     .status(201)
//     .location(`http://localhost:8000/bookmarks/${bookmark.id}`)
//     .json(bookmark);
// });  


bookmarksRouter
  .route('/bookmarks/:bookmarkId')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db');
    const id = req.params.bookmarkId;
    BookmarksService.getById(knexInstance, id)
      .then(bookmark => {
        if (!bookmark) {
          return res.status(404).json({
            error: { message: 'Bookmark doesn\'t exist' }
          });
        }
        res.json(bookmark);
      })
      .catch(next);
  });
// .delete((req, res) => {
//   const { bookmarkId } = req.params;
//   const bookmarkIndex = bookmarks.findIndex(itm => itm.id === bookmarkId);
//   if (bookmarkIndex === -1) {
//     logger.error(`Bookmark with id ${bookmarkId} not found.`);
//     return res
//       .status(404)
//       .send('Not found');
//   }

    
//   bookmarks.splice(bookmarkIndex, 1);

//   logger.info(`Card with id ${bookmarkId} deleted`);

//   res
//     .status(204)
//     .end();
// });

module.exports = bookmarksRouter;