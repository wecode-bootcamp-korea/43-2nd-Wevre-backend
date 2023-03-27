-- migrate:up
CREATE TABLE items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  seller_id INT NOT NULL,
  category_id INT NOT NULL,
  item_name VARCHAR(200) NOT NULL,
  author_name VARCHAR(200) NOT NULL,
  production_year INT NOT NULL,
  width DECIMAL(65, 2) NOT NULL,
  length DECIMAL(65, 2) NOT NULL,
  height DECIMAL(65, 2) NOT NULL,
  weight DECIMAL(65, 5) NOT NULL,
  admin_number VARCHAR(300) UNIQUE NOT NULL,
  description TEXT NOT NULL,
  image_url VARCHAR(2000) NOT NULL,
  starting_bid DECIMAL(65, 2) NOT NULL,
  bidding_start TIMESTAMP NOT NULL,
  bidding_end TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT items_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES users (id),
  CONSTRAINT items_category_id_fkey FOREIGN KEY (category_id) REFERENCES categories (id)
);

-- migrate:down
DROP TABLE items;