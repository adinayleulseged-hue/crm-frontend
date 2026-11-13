package com.insa.crm.controller;

import com.insa.crm.dto.ApiResponse;
import com.insa.crm.dto.PageResponse;
import com.insa.crm.dto.product.ProductRequest;
import com.insa.crm.dto.product.ProductResponse;
import com.insa.crm.model.enums.ProductCategory;
import com.insa.crm.model.enums.ProductStatus;
import com.insa.crm.service.ProductService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Products")
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<ProductResponse>>> getAllProducts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) ProductCategory category,
            @RequestParam(required = false) ProductStatus status,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(productService.getAllProducts(search, category, status, pageable))));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(productService.getProductById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProductResponse>> createProduct(@Valid @RequestBody ProductRequest req) {
        return ResponseEntity.ok(ApiResponse.success(productService.createProduct(req)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> updateProduct(@PathVariable Long id, @Valid @RequestBody ProductRequest req) {
        return ResponseEntity.ok(ApiResponse.success(productService.updateProduct(id, req)));
    }

    @PatchMapping("/{id}/stock")
    public ResponseEntity<ApiResponse<ProductResponse>> updateStock(
            @PathVariable Long id,
            @RequestParam Integer delta) {
        return ResponseEntity.ok(ApiResponse.success(productService.updateStock(id, delta)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
