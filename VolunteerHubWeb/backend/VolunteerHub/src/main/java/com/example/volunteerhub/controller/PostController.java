package com.example.volunteerhub.controller;

import com.example.volunteerhub.dto.PostDTO;
import com.example.volunteerhub.service.PostService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.ErrorResponse;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.MediaType;
import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    @Autowired
    private PostService postService;

    @Value("${upload.dir:uploads}")
    private String uploadDir;

    @PostMapping(value = "/create", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Create a new post (with optional images)")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PostDTO> createPostMultipart(
            @RequestParam("eventId") Long eventId,
            @RequestParam(value = "content", required = false) String content,
            @RequestParam(value = "mediaFiles", required = false) MultipartFile[] mediaFiles,
            Authentication authentication
    ) {
        try {
            List<String> savedNames = new ArrayList<>();
            Path baseDir = Path.of(uploadDir != null && !uploadDir.isBlank() ? uploadDir : "uploads")
                    .toAbsolutePath().normalize()
                    .resolve("post");
            Files.createDirectories(baseDir);

            if (mediaFiles != null && mediaFiles.length > 0) {
                for (MultipartFile f : mediaFiles) {
                    if (f == null || f.isEmpty()) continue;
                    String original = Path.of(f.getOriginalFilename()).getFileName().toString();
                    String filename = System.currentTimeMillis() + "_" + original.replaceAll("[^a-zA-Z0-9._-]", "_");
                    Path target = baseDir.resolve(filename);
                    Files.copy(f.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

                    // debug log
                    System.out.println("[PostController] saved -> " + target.toAbsolutePath());

                    // store relative path used by frontend: "post/filename"
                    savedNames.add("post/" + filename);
                }
            }

            PostDTO dto = new PostDTO();
            dto.setEventId(eventId);
            dto.setContent(content);
            dto.setMediaFiles(savedNames);

            PostDTO created = postService.createPost(dto, authentication.getName());
            return ResponseEntity.ok(created);
        } catch (Exception ex) {
            throw new RuntimeException("Không thể tạo bài viết: " + ex.getMessage());
        }
    }

    @GetMapping("/get/{id}")
    @Operation(summary = "Get post by ID", responses = {
            @ApiResponse(responseCode = "200", description = "Success", content = @Content(mediaType = "application/json", schema = @Schema(implementation = PostDTO.class))),
            @ApiResponse(responseCode = "404", description = "Not Found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PostDTO> getPostById(@PathVariable Long id, Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(postService.getPostById(id, email));
    }

    @GetMapping("/event/{eventId}")
    @Operation(summary = "Get posts by event", responses = {
            @ApiResponse(responseCode = "200", description = "Success", content = @Content(mediaType = "application/json", schema = @Schema(implementation = PostDTO.class))),
            @ApiResponse(responseCode = "404", description = "Not Found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<PostDTO>> getPostsByEvent(@PathVariable Long eventId, Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(postService.getPostsByEvent(eventId, email));
    }

    @PutMapping(value = "/update/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PostDTO> updatePost(
            @PathVariable Long id,
            @RequestParam(value = "content", required = false) String content,
            @RequestParam(value = "mediaFiles", required = false) MultipartFile[] mediaFiles,
            Authentication authentication
    ) {
        PostDTO dto = postService.updatePostMultipart(id, content, mediaFiles, authentication.getName());
        return ResponseEntity.ok(dto);
    }

    // New: delete one media from a post
    @DeleteMapping("/{postId}/media")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PostDTO> deletePostMedia(
            @PathVariable Long postId,
            @RequestParam("file") String filePath,
            Authentication authentication
    ) {
        String email = authentication.getName();
        PostDTO dto = postService.deletePostMedia(postId, filePath, email);
        return ResponseEntity.ok(dto);
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deletePost(@PathVariable Long id, Authentication authentication) {
        postService.deletePost(id, authentication.getName());
        return ResponseEntity.ok().build();
    }

    @PutMapping("/approve/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_EVENT_MANAGER','ROLE_ADMIN')")
    public ResponseEntity<PostDTO> approvePost(@PathVariable Long id, Authentication authentication) {
        PostDTO dto = postService.approvePost(id, authentication.getName());
        return ResponseEntity.ok(dto);
    }

    @PutMapping("/reject/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_EVENT_MANAGER','ROLE_ADMIN')")
    public ResponseEntity<PostDTO> rejectPost(@PathVariable Long id, Authentication authentication) {
        PostDTO dto = postService.rejectPost(id, authentication.getName());
        return ResponseEntity.ok(dto);
    }
}