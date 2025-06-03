package com.campusdual.bfp.model.dao;

import com.campusdual.bfp.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductDao extends JpaRepository<Product, Integer> {

}
