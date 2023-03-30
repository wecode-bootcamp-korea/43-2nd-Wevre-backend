-- migrate:up
ALTER TABLE orders DROP FOREIGN KEY orders_shipment_id_fkey;
ALTER TABLE orders DROP INDEX shipment_id;

ALTER TABLE orders
ADD CONSTRAINT orders_shipment_id_fkey FOREIGN KEY (shipment_id) REFERENCES shipment (id)
-- migrate:down
