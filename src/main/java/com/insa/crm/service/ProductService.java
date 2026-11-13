package com.insa.crm.service;

import com.insa.crm.dto.product.ProductRequest;
import com.insa.crm.dto.product.ProductResponse;
import com.insa.crm.model.Product;
import com.insa.crm.model.enums.ProductCategory;
import com.insa.crm.model.enums.ProductStatus;
import com.insa.crm.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductService {
    private final ProductRepository productRepository;

    public Page<ProductResponse> getAllProducts(String search, ProductCategory category, ProductStatus status, Pageable pageable) {
        if (search != null && !search.isBlank()) {
            return productRepository.findByNameContainingIgnoreCaseOrProductCodeContainingIgnoreCase(search, search, pageable)
                    .map(this::mapToResponse);
        }
        if (category != null) {
            return productRepository.findByCategory(category, pageable).map(this::mapToResponse);
        }
        if (status != null) {
            return productRepository.findByStatus(status, pageable).map(this::mapToResponse);
        }
        return productRepository.findAll(pageable).map(this::mapToResponse);
    }

    public ProductResponse getProductById(Long id) {
        return mapToResponse(productRepository.findById(id).orElseThrow());
    }

    @Transactional
    public ProductResponse createProduct(ProductRequest req) {
        Product product = new Product();
        product.setProductCode(String.format("PRD-%d-%03d", LocalDate.now().getYear(), productRepository.count() + 1));
        mapRequestToEntity(req, product);
        log.info("Created new product: {} [{}]", product.getName(), product.getProductCode());
        return mapToResponse(productRepository.save(product));
    }

    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest req) {
        Product product = productRepository.findById(id).orElseThrow();
        mapRequestToEntity(req, product);
        log.info("Updated product ID #{}: {}", id, product.getName());
        return mapToResponse(productRepository.save(product));
    }

    @Transactional
    public ProductResponse updateStock(Long id, Integer quantityDelta) {
        Product product = productRepository.findById(id).orElseThrow();
        int newQty = (product.getStockQuantity() != null ? product.getStockQuantity() : 0) + quantityDelta;
        if (newQty < 0) newQty = 0;
        product.setStockQuantity(newQty);
        if (newQty == 0) {
            product.setStatus(ProductStatus.OUT_OF_STOCK);
        } else if (product.getStatus() == ProductStatus.OUT_OF_STOCK) {
            product.setStatus(ProductStatus.ACTIVE);
        }
        log.info("Updated product #{} stock quantity to {}", id, newQty);
        return mapToResponse(productRepository.save(product));
    }

    @Transactional
    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
        log.info("Deleted product ID #{}", id);
    }

    private void mapRequestToEntity(ProductRequest req, Product product) {
        product.setName(req.getName());
        if (req.getCategory() != null) product.setCategory(req.getCategory());
        product.setDescription(req.getDescription());
        if (req.getUnitPrice() != null) product.setUnitPrice(req.getUnitPrice());
        product.setSku(req.getSku() != null ? req.getSku() : String.format("SKU-%d", System.currentTimeMillis() % 10000));
        product.setStockQuantity(req.getStockQuantity() != null ? req.getStockQuantity() : 0);
        if (req.getStatus() != null) product.setStatus(req.getStatus());
    }

    private ProductResponse mapToResponse(Product product) {
        return ProductResponse.builder()
                .id(product.getId())
                .productCode(product.getProductCode())
                .name(product.getName())
                .category(product.getCategory() != null ? product.getCategory().name() : null)
                .description(product.getDescription())
                .unitPrice(product.getUnitPrice())
                .sku(product.getSku())
                .stockQuantity(product.getStockQuantity())
                .status(product.getStatus() != null ? product.getStatus().name() : null)
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }
}
