-- migrate:up
CREATE TABLE shipment (
  id INT PRIMARY KEY AUTO_INCREMENT,
  fee DECIMAL(65, 2) NOT NULL
);

-- migrate:down
DROP TABLE shipment;