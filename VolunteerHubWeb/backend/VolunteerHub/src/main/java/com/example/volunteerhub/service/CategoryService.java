package com.example.volunteerhub.service;

import com.example.volunteerhub.dto.CategoryDTO;
import com.example.volunteerhub.entity.Category;
import com.example.volunteerhub.entity.User;
import com.example.volunteerhub.entity.enums.UserRole;
import com.example.volunteerhub.repository.CategoryRepository;
import com.example.volunteerhub.repository.UserRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ModelMapper modelMapper;

    // Create
    public CategoryDTO createCategory(CategoryDTO categoryDTO, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (user.getRole() != UserRole.EVENT_MANAGER && user.getRole() != UserRole.ADMIN) {
            throw new RuntimeException("Unauthorized");
        }
        Category category = modelMapper.map(categoryDTO, Category.class);
        category.setCreatedAt(LocalDateTime.now());
        category = categoryRepository.save(category);
        return modelMapper.map(category, CategoryDTO.class);
    }

    // Read
    public CategoryDTO getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        return modelMapper.map(category, CategoryDTO.class);
    }

    public List<CategoryDTO> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(category -> modelMapper.map(category, CategoryDTO.class))
                .collect(Collectors.toList());
    }

    // Update
    public CategoryDTO updateCategory(Long id, CategoryDTO categoryDTO, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (user.getRole() != UserRole.EVENT_MANAGER && user.getRole() != UserRole.ADMIN) {
            throw new RuntimeException("Unauthorized");
        }
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        category.setName(categoryDTO.getName());
        category.setDescription(categoryDTO.getDescription());
        category.setUpdatedAt(LocalDateTime.now());
        category = categoryRepository.save(category);
        return modelMapper.map(category, CategoryDTO.class);
    }

    // Delete
    public void deleteCategory(Long id, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (user.getRole() != UserRole.EVENT_MANAGER && user.getRole() != UserRole.ADMIN) {
            throw new RuntimeException("Unauthorized");
        }
        categoryRepository.deleteById(id);
    }
}
