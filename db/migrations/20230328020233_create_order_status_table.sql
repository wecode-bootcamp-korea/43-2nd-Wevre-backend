-- migrate:up
CREATE TABLE order_status (
  id int PRIMARY KEY AUTO_INCREMENT,
  name varchar(100) UNIQUE NOT NULL
);

-- migrate:down
DROP TABLE order_status;