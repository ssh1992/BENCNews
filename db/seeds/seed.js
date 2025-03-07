const db = require("../connection");
//const { topicData, userData, articleData, commentData } = require("../data/development-data");
const format = require("pg-format");

const seed = ({ topicData, userData, articleData, commentData }) => {
  return db
    .query(`DROP TABLE IF EXISTS comments, articles, users, topics;`)
    .then(() => {
      return db.query(`
        CREATE TABLE topics (
          slug VARCHAR(100) PRIMARY KEY,
          description VARCHAR(100) NOT NULL,
          img_url VARCHAR(1000)
        );
      `);
    })
    .then(() => {
      return db.query(`
        CREATE TABLE users (
          username VARCHAR(100) PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          avatar_url VARCHAR(1000) NOT NULL
        );
      `);
    })
    .then(() => {
      return db.query(`
        CREATE TABLE articles (
          article_id SERIAL PRIMARY KEY,
          title VARCHAR(100) NOT NULL,
          topic VARCHAR(100) REFERENCES topics(slug),
          author VARCHAR(100) REFERENCES users(username),
          body TEXT NOT NULL,
          votes INT DEFAULT 0,
          article_img_url VARCHAR(1000),
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);
    })
    .then(() => {
      return db.query(`
        CREATE TABLE comments (
          comment_id SERIAL PRIMARY KEY,
          article_id INT REFERENCES articles(article_id),
          author VARCHAR(100) REFERENCES users(username),
          body TEXT NOT NULL,
          votes INT DEFAULT 0,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);
    })
    .then(() => {
      console.log("Tables created successfully!");

      const nestedArrayUsers = userData.map(({ username, name, avatar_url }) => [
        username,
        name,
        avatar_url,
      ]);
      const dataInsertUsers = format(
        `INSERT INTO users (username, name, avatar_url) VALUES %L RETURNING *;`,
        nestedArrayUsers
      );
      return db.query(dataInsertUsers);
    })
    .then(() => {
      console.log("Users inserted successfully!");

      const nestedArrayTopics = topicData.map(({ description, slug, img_url }) => [
        slug,
        description,
        img_url,
      ]);
      const dataInsertTopics = format(
        `INSERT INTO topics (slug, description, img_url) VALUES %L RETURNING *;`,
        nestedArrayTopics
      );
      return db.query(dataInsertTopics);
    })
    .then(() => {
      console.log("Topics inserted successfully!");

      const nestedArrayArticles = articleData.map(({ title, topic, author, body, created_at, votes, article_img_url }) => [
        title,
        topic,
        author,
        body,
        created_at,
        votes,
        article_img_url,
      ]);
      const dataInsertArticles = format(
        `INSERT INTO articles (title, topic, author, body, created_at, votes, article_img_url) VALUES %L RETURNING *;`,
        nestedArrayArticles
      );
      return db.query(dataInsertArticles);
    })
    .then(({ rows: articles }) => {
      console.log("Articles inserted successfully!");

      const articleIdLookup = {};
      articles.forEach((article) => {
        articleIdLookup[article.title] = article.article_id;
      });

      const nestedArrayComments = commentData.map(({ body, votes, author, created_at, article_title }) => [
        articleIdLookup[article_title],
        author,
        body,
        votes,
        created_at,
      ]);

      const dataInsertComments = format(
        `INSERT INTO comments (article_id, author, body, votes, created_at) VALUES %L RETURNING *;`,
        nestedArrayComments
      );
      return db.query(dataInsertComments);
    })
    .then(() => {
      console.log("Comments inserted successfully!");
    })
    .catch((err) => {
      console.error("Error seeding database:", err);
    });
};

module.exports = seed;
