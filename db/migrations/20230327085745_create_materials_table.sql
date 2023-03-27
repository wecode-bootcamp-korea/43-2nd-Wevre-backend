-- migrate:up
CREATE TABLE materials (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(200) UNIQUE NOT NULL
)

-- migrate:down
DROP TABLE materials;