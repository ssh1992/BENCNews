const db = require("../connection");
const {topicData, userData, articleData, commentData} = require("../data/development-data");
const format = require("pg-format");
const seed = ({ topicData, userData, articleData, commentData }) => {

  //////////create and drop tables

  return db.query(`DROP TABLE IF EXISTS comments, articles, users, topics`)
    // topics table
    .then(() => {
      return db.query(`
        CREATE TABLE topics (
          slug VARCHAR(100) PRIMARY KEY,
          description VARCHAR(100) NOT NULL,
          IMG_URL VARCHAR(1000)
        );
      `);
    })

    // users table
    .then(() => {
      return db.query(`
        CREATE TABLE users (
          username VARCHAR(100) PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          avatar_url VARCHAR(1000) NOT NULL
        );
      `);
    })

    // articles table
    .then(() => {
      return db.query(`
        CREATE TABLE articles (
          article_id SERIAL PRIMARY KEY,
          title VARCHAR(100) NOT NULL,
          topic VARCHAR(100)  REFERENCES topics(slug),
          author VARCHAR(100)  REFERENCES users(username),
          body TEXT NOT NULL,
          votes INT DEFAULT 0,
          article_img_url VARCHAR(1000),
          created_at TIMESTAMP
        );
      `);
    })

    // comments table
    .then(() => {
      return db.query(`
        CREATE TABLE comments (
          article_title INT REFERENCES articles(title),
          comment_id SERIAL PRIMARY KEY,
          body TEXT,
          votes INT,
          author VARCHAR(100),
          created_at TIMESTAMP
        );
      `);
    })
    .then(() => {
      console.log("Tables created successfully!");
    })

    .catch((err) => {
      console.log("error! seeding failed!", err);
    }).then(() => {
const nestedArrayComments = commentData.map((comment) => {
 return [['article_title', comment.article_title], ['body', comment.body], ['votes', comment.votes], ['author', comment.author], ['created_at', comment.created_at]]
  })
  
  //insert data
  
  const dataInsertComments = format(
    `INSERT INTO comments(article_title, body, votes, author, created_at) VALUES %L RETURNING*;`, nestedArrayComments
  )
  
  return db.query(dataInsertComments)
  .then((resultsInserted) => {
    console.log("Data inserted succesfully!");
  })
  .catch((error) => {
    console.log("Unsuccessful insertion!");
  })
}).then(
  () => {
    const nextedArrayArticles = articleData.map((article) => {
      
    })
  }
)
};

  
module.exports = seed;