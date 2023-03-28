-- migrate:up
CREATE TABLE bids (
  id INT PRIMARY KEY AUTO_INCREMENT,
  item_id INT NOT NULL,
  buyer_id INT NOT NULL,
  bid_price DECIMAL(65, 2) NOT NULL,
  bid_price_change_rate DECIMAL(65, 3) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT bids_item_id_fkey FOREIGN KEY (item_id) REFERENCES items (id),
  CONSTRAINT bids_buyer_id_fkey FOREIGN KEY (buyer_id) REFERENCES users (id)
)

-- migrate:down
DROP TABLE bids;