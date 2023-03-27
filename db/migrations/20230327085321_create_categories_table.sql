-- migrate:up
CREATE TABLE categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(200) UNIQUE NOT NULL
);

-- migrate:down
DROP TABLE categories;