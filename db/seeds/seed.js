const db = require("../connection")
const format=require("pg-format")
const  seed = ({ topicData, userData, articleData, commentData }) => {
  return db.query(`DROP TABLE IF EXISTS comments, articles, topics, users;`)
      .then(()=>{
        return db.query(`CREATE TABLE topics(
          slug VARCHAR(100) PRIMARY KEY ,
          description VARCHAR(100) NOT NULL,
          img_url VARCHAR(1000) NOT NULL
      )`)})
      .then(()=>{
        return db.query(`CREATE TABLE users(
          username VARCHAR(100) PRIMARY KEY,
          name VARCHAR(100),
          avatar_url VARCHAR(1000) NOT NULL
      )`)})
      .then(()=>{
        return db.query(`CREATE TABLE articles(
          article_id SERIAL PRIMARY KEY,
          title VARCHAR(100) NOT NULL,
          topic  VARCHAR(100)  REFERENCES topics(slug),
          author  VARCHAR(100) REFERENCES users(username),
          body TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          votes INT,
          article_img_url VARCHAR(1000)
      )`)})
      .then(()=>{
        return db.query(`CREATE TABLE comments(
          comment_id SERIAL PRIMARY KEY,
          article_id INT REFERENCES articles(article_id),
          body TEXT,
          votes INT,
          author VARCHAR(100) REFERENCES users(username),
          created_at TIMESTAMP
      )`)})
      .then(()=>{
        const formattedTopics = topicData.map((topicsData)=>{
          return [topicsData.slug, topicsData.description, topicsData.img_url]
        })
        const sqlString = format(`INSERT INTO
        topics (slug, description,img_url)
        VALUES %L RETURNING *`, formattedTopics)
        return db.query(sqlString)
      })
      .then(()=>{
        const formattedUsers = userData.map((usersData)=>{
          return [
            usersData.username,
            usersData.name,
            usersData.avatar_url]
        })
        const sqlString = format(`INSERT INTO users
        (username, name, avatar_url)
        VALUES %L RETURNING *`, formattedUsers)
        return db.query(sqlString)
      })
      .then(()=>{
        const formattedArticles = articleData.map(
          (articleData) => {
            const convertTime = convertTimestampToDate(articleData)
            return [
              articleData.title,
              articleData.topic,
              articleData.author,
              articleData.body,
              convertTime.created_at,
              articleData.votes,
              articleData.article_img_url            ]
        })
        const sqlString = format(`INSERT INTO articles
        (title, topic, author, body, created_at, votes, article_img_url)
        VALUES %L RETURNING *`, formattedArticles)
        return db.query(sqlString)
      })
      .then(()=>{
        const formattedComments = commentData.map(
          (commentsData)=>{
            const convertTime = convertTimestampToDate(commentsData)
          return [
            commentsData.body,
            commentsData.votes,
            commentsData.author,
            convertTime.created_at
          ]
        })
        const sqlString = format(`INSERT INTO comments (body, votes, author, created_at) VALUES %L RETURNING *`, formattedComments)
        return db.query(sqlString)
      })};
module.exports = seed;