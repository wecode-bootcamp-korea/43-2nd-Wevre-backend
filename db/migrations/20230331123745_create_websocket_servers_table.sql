-- migrate:up
CREATE TABLE websocket_servers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  item_id INT NOT NULL UNIQUE,
  server JSON NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT websocket_servers_item_id_fkey FOREIGN KEY (item_id) REFERENCES items (id)
);

-- migrate:down
DROP TABLE websocket_servers