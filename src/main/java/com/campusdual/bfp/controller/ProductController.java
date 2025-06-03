package com.campusdual.bfp.controller;

import com.campusdual.bfp.api.IProductService;
import com.campusdual.bfp.model.dto.ProductDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController()
@RequestMapping("/products")
public class ProductController {

    @Autowired
    private IProductService productService;


    @GetMapping
    public String testController() {
        return "Products controller works!";
    }
    @PostMapping
    public String testController(@RequestBody String name) {
        return "Products controller works, " + name +"!";
    }
    @GetMapping(value = "/testMethod")
    public String testControllerMethod() { return "Products controller method works!"; }
    @PostMapping(value = "/get")
    public ProductDTO queryProduct(@RequestBody ProductDTO productDTO) { return productService.queryProduct (productDTO); }
    @GetMapping (value = "/getAll")
    public List<ProductDTO> queryAllProducts() { return productService.queryAllProducts(); }
    @PostMapping(value = "/add")
    public int addProduct(@RequestBody ProductDTO productDTO) { return productService.insertProduct(productDTO); }
    @PutMapping(value = "/update")
    public int updateProduct(@RequestBody ProductDTO productDTO) { return productService.updateProduct(productDTO); }
    @DeleteMapping(value = "/delete")
    public int deleteProduct(@RequestBody ProductDTO productDTO) { return productService.deleteProduct(productDTO); }

}