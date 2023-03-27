-- migrate:up
CREATE TABLE orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  shipment_id INT NOT NULL UNIQUE,
  bid_id INT NOT NULL UNIQUE,
  order_status_id INT NOT NULL, 
  phone_number VARCHAR(100) NOT NULL,
  street VARCHAR(200) NOT NULL,
  address VARCHAR(200) NOT NULL,
  zipcode VARCHAR(100) NOT NULL,
  price DECIMAL(65,2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES users (id),
  CONSTRAINT orders_shipment_id_fkey FOREIGN KEY (shipment_id) REFERENCES shipment (id),
  CONSTRAINT orders_bid_id_fkey FOREIGN KEY (bid_id) REFERENCES bids (id),
  CONSTRAINT orders_status_id_fkey FOREIGN KEY (order_status_id) REFERENCES order_status (id)
);

-- migrate:down
DROP TABLE orders;