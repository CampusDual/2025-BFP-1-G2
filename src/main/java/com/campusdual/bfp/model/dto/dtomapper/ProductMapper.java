package com.campusdual.bfp.model.dto.dtomapper;

import com.campusdual.bfp.model.Product;
import com.campusdual.bfp.model.dto.ProductDTO;
import org.mapstruct.factory.Mappers;

import java.util.List;

public interface ProductMapper {
    ProductMapper INSTANCE = Mappers.getMapper(ProductMapper.class);
    ProductDTO toDTO(Product product);
    List<ProductDTO> toDTOList(List<Product> products);
    Product toEntity(ProductDTO productdto);
}