package com.example.volunteerhub.controller;

import com.example.volunteerhub.dto.ReactionDTO;
import com.example.volunteerhub.service.ReactionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.ErrorResponse;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reactions")
public class ReactionController {

    @Autowired
    private ReactionService reactionService;

    @PostMapping("/create")
    @Operation(summary = "Add a new reaction", responses = {
            @ApiResponse(responseCode = "200", description = "Success", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ReactionDTO.class))),
            @ApiResponse(responseCode = "400", description = "Bad Request", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    }, parameters = {
            @Parameter(name = "Authorization", in = ParameterIn.HEADER, schema = @Schema(type = "string"), example = "Bearer <token>", required = true)
    })
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ReactionDTO> addReaction(@Valid @RequestBody ReactionDTO reactionDTO, Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(reactionService.addReaction(reactionDTO, email));
    }

    @GetMapping("/get/{id}")
    @Operation(summary = "Get reaction by ID", responses = {
            @ApiResponse(responseCode = "200", description = "Success", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ReactionDTO.class))),
            @ApiResponse(responseCode = "404", description = "Not Found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ReactionDTO> getReactionById(@PathVariable Long id, Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(reactionService.getReactionById(id, email));
    }

    @GetMapping("/post/{postId}")
    @Operation(summary = "Get reactions by post", responses = {
            @ApiResponse(responseCode = "200", description = "Success", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ReactionDTO.class))),
            @ApiResponse(responseCode = "404", description = "Not Found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ReactionDTO>> getReactionsByPost(@PathVariable Long postId, Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(reactionService.getReactionsByPost(postId, email));
    }

    @GetMapping("/comment/{commentId}")
    @Operation(summary = "Get reactions by comment", responses = {
            @ApiResponse(responseCode = "200", description = "Success", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ReactionDTO.class))),
            @ApiResponse(responseCode = "404", description = "Not Found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<List<ReactionDTO>> getReactionsByComment(@PathVariable Long commentId, Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(reactionService.getReactionsByComment(commentId, email));
    }

    @PutMapping("/update/{id}")
    @Operation(summary = "Update reaction", responses = {
            @ApiResponse(responseCode = "200", description = "Success", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ReactionDTO.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Not Found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    }, parameters = {
            @Parameter(name = "Authorization", in = ParameterIn.HEADER, schema = @Schema(type = "string"), example = "Bearer <token>", required = true)
    })
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ReactionDTO> updateReaction(@PathVariable Long id, @Valid @RequestBody ReactionDTO reactionDTO, Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(reactionService.updateReaction(id, reactionDTO, email));
    }

    @DeleteMapping("/delete/{id}")
    @Operation(summary = "Delete reaction", responses = {
            @ApiResponse(responseCode = "200", description = "Success", content = @Content(mediaType = "application/json")),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Not Found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    }, parameters = {
            @Parameter(name = "Authorization", in = ParameterIn.HEADER, schema = @Schema(type = "string"), example = "Bearer <token>", required = true)
    })
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteReaction(@PathVariable Long id, Authentication authentication) {
        String email = authentication.getName();
        reactionService.deleteReaction(id, email);
        return ResponseEntity.ok().build();
    }
}