-- migrate:up
CREATE TABLE bid_status
(
    id          INT PRIMARY KEY AUTO_INCREMENT,
    status     VARCHAR(100) NOT NULL
);

-- migrate:down
DROP TABLE bid_status;