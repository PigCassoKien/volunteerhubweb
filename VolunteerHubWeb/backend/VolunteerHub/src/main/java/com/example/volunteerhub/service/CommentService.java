package com.example.volunteerhub.service;

import com.example.volunteerhub.dto.CommentDTO;
import com.example.volunteerhub.entity.Comment;
import com.example.volunteerhub.entity.Post;
import com.example.volunteerhub.entity.User;
import com.example.volunteerhub.repository.CommentRepository;
import com.example.volunteerhub.repository.PostRepository;
import com.example.volunteerhub.repository.UserRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CommentService {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private EventRegistrationService registrationService;

    @Autowired
    private ModelMapper modelMapper;

    // Create
    public CommentDTO createComment(CommentDTO commentDTO, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Post post = postRepository.findById(commentDTO.getPostId())
                .orElseThrow(() -> new RuntimeException("Post not found"));

        Long eventId = post.getEvent().getId();
        boolean isEventManager = post.getEvent().getCreatedBy() != null && post.getEvent().getCreatedBy().getId().equals(user.getId());
        boolean isParticipant = registrationService.hasApproveRegistration(eventId, user.getId());

        if (!isEventManager && !isParticipant) {
            throw new RuntimeException("Unauthorized to comment on this post");
        }

        Comment comment = new Comment();
        comment.setPost(post);
        comment.setUser(user);
        comment.setContent(commentDTO.getContent());
        comment.setCreatedAt(LocalDateTime.now());

        if (commentDTO.getParentCommentId() != null) {
            Comment parentComment = commentRepository.findById(commentDTO.getParentCommentId())
                    .orElseThrow(() -> new RuntimeException("Parent comment not found"));
            comment.setParentComment(parentComment);
        }

        // save before mapping
        comment = commentRepository.save(comment);

        CommentDTO dto = modelMapper.map(comment, CommentDTO.class);
        dto.setUserId(comment.getUser().getId());
        dto.setPostId(comment.getPost().getId());
        dto.setParentCommentId(comment.getParentComment() != null ? comment.getParentComment().getId() : null);
        dto.setCreatedAt(comment.getCreatedAt());
        dto.setUpdatedAt(comment.getUpdatedAt());
        return dto;
    }

    // Read single comment (only participants or manager)
    public CommentDTO getCommentById(Long id, String email) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        Post post = comment.getPost();
        Long eventId = post.getEvent().getId();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean isEventManager = post.getEvent().getCreatedBy() != null && post.getEvent().getCreatedBy().getId().equals(user.getId());
        boolean isParticipant = registrationService.hasApproveRegistration(eventId, user.getId());

        if (!isEventManager && !isParticipant) {
            throw new RuntimeException("Forbidden: only event participants or manager can view comments");
        }

        CommentDTO dto = modelMapper.map(comment, CommentDTO.class);
        dto.setUserId(comment.getUser().getId());
        dto.setPostId(post.getId());
        dto.setParentCommentId(comment.getParentComment() != null ? comment.getParentComment().getId() : null);
        dto.setCreatedAt(comment.getCreatedAt());
        dto.setUpdatedAt(comment.getUpdatedAt());
        return dto;
    }

    public List<CommentDTO> getCommentsByPost(Long postId, String email) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        Long eventId = post.getEvent().getId();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean isEventManager = post.getEvent().getCreatedBy() != null && post.getEvent().getCreatedBy().getId().equals(user.getId());
        boolean isParticipant = registrationService.hasApproveRegistration(eventId, user.getId());

        if (!isEventManager && !isParticipant) {
            throw new RuntimeException("Forbidden: only event participants or manager can view comments");
        }

        return commentRepository.findByPostId(postId).stream()
                .map(comment -> {
                    CommentDTO dto = modelMapper.map(comment, CommentDTO.class);
                    dto.setUserId(comment.getUser().getId());
                    dto.setPostId(postId);
                    dto.setParentCommentId(comment.getParentComment() != null ? comment.getParentComment().getId() : null);
                    dto.setCreatedAt(comment.getCreatedAt());
                    dto.setUpdatedAt(comment.getUpdatedAt());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    // Update - only comment owner
    public CommentDTO updateComment(Long id, CommentDTO commentDTO, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        if (!comment.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized: only comment owner can update");
        }

        comment.setContent(commentDTO.getContent());
        comment.setUpdatedAt(LocalDateTime.now());
        comment = commentRepository.save(comment);

        CommentDTO dto = modelMapper.map(comment, CommentDTO.class);
        dto.setUserId(comment.getUser().getId());
        dto.setPostId(comment.getPost().getId());
        dto.setParentCommentId(comment.getParentComment() != null ? comment.getParentComment().getId() : null);
        dto.setCreatedAt(comment.getCreatedAt());
        dto.setUpdatedAt(comment.getUpdatedAt());
        return dto;
    }

    // Delete - comment owner OR post owner; delete children recursively
    public void deleteComment(Long id, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        Long postOwnerId = comment.getPost().getUser().getId();
        boolean isCommentOwner = comment.getUser().getId().equals(user.getId());
        boolean isPostOwner = postOwnerId.equals(user.getId());

        if (!isCommentOwner && !isPostOwner) {
            throw new RuntimeException("Unauthorized: only comment owner or post owner can delete");
        }

        deleteRecursively(comment);
    }

    private void deleteRecursively(Comment comment) {
        List<Comment> children = commentRepository.findByParentComment(comment);
        for (Comment child : children) {
            deleteRecursively(child);
        }
        commentRepository.delete(comment);
    }
}
