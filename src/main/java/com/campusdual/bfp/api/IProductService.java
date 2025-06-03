package com.campusdual.bfp.api;

import com.campusdual.bfp.model.dto.ProductDTO;

import java.util.List;

public interface IProductService {
    ProductDTO queryProduct(ProductDTO productDTO);
    List<ProductDTO> queryAllProducts();
    int insertProduct(ProductDTO productDTO);
    int updateProduct(ProductDTO productDTO);
    int deleteProduct(ProductDTO productDTO);
}