-- migrate:up
CREATE TABLE wishlist (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  item_id INT NOT NULL,
  CONSTRAINT wishlist_item_id_fkey FOREIGN KEY (item_id) REFERENCES items (id),
  CONSTRAINT wishlist_user_id_fkey FOREIGN KEY (user_id) REFERENCES users (id),
  CONSTRAINT wishlist_unique_key UNIQUE (user_id, item_id)
);

-- migrate:down
DROP TABLE wishlist;
