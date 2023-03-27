-- migrate:up
CREATE TABLE items_materials (
  id INT PRIMARY KEY AUTO_INCREMENT,
  item_id INT NOT NULL,
  material_id INT NOT NULL,
  CONSTRAINT items_materials_item_id_fkey FOREIGN KEY (item_id) REFERENCES items (id),
  CONSTRAINT items_materials_material_id_fkey FOREIGN KEY (material_id) REFERENCES materials (id),
  CONSTRAINT items_materials_unique_key UNIQUE (item_id, material_id)
);

-- migrate:down
DROP TABLE items_materials;
