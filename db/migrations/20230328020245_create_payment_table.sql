-- migrate:up
CREATE TABLE payment (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  order_id INT NOT NULL UNIQUE,
  payment_number varchar(300) NOT NULL,
  method_type varchar(200) NOT NULL,
  item_name varchar(200) NOT NULL,
  amount decimal(65, 2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT payment_user_id_fkey FOREIGN KEY (user_id) REFERENCES users (id),
  CONSTRAINT payment_order_id_fkey FOREIGN KEY (order_id) REFERENCES orders (id)
);

-- migrate:down
DROP TABLE payment;