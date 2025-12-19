package com.example.volunteerhub.service;

import com.example.volunteerhub.dto.CommentDTO;
import com.example.volunteerhub.entity.Comment;
import com.example.volunteerhub.entity.Post;
import com.example.volunteerhub.entity.User;
import com.example.volunteerhub.entity.enums.RelatedType;
import com.example.volunteerhub.entity.enums.UserRole;
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

    @Autowired
    private NotificationService notificationService;

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

        // NEW: notify post owner (if not commenter)
        Long postOwnerId = post.getUser().getId();
        if (!postOwnerId.equals(user.getId())) {
            notificationService.notifyComment(postOwnerId, post.getId(), RelatedType.POST, user.getId());
        }

        // If this is a reply to another comment, also notify the parent comment's owner (if not the same as commenter)
        if (comment.getParentComment() != null && comment.getParentComment().getUser() != null) {
            Long parentOwnerId = comment.getParentComment().getUser().getId();
            if (!parentOwnerId.equals(user.getId())) {
                // relatedId = parent comment id, relatedType = COMMENT
                notificationService.notifyComment(parentOwnerId, comment.getParentComment().getId(), RelatedType.COMMENT, user.getId());
            }
        }

        CommentDTO dto = modelMapper.map(comment, CommentDTO.class);
        dto.setUserId(comment.getUser().getId());
        dto.setUserAvatarFile(comment.getUser() != null ? comment.getUser().getAvatarFile() : null);
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
        dto.setUserAvatarFile(comment.getUser() != null ? comment.getUser().getAvatarFile() : null);
        dto.setPostId(post.getId());
        dto.setParentCommentId(comment.getParentComment() != null ? comment.getParentComment().getId() : null);
        dto.setCreatedAt(comment.getCreatedAt());
        dto.setUpdatedAt(comment.getUpdatedAt());
        return dto;
    }

    public List<CommentDTO> getCommentsByPost(Long postId, String email) {
        Post post = postRepository.findById(postId).orElseThrow(() -> new RuntimeException("Post not found"));
        User requester;
        if (email != null) requester = userRepository.findByEmail(email).orElse(null);
        else {
            requester = null;
        }

        List<Comment> flat = commentRepository.findByPostId(postId);
        // map and set canDelete: comment owner OR post owner OR event manager OR admin
        List<CommentDTO> dtos = flat.stream().map(c -> {
            CommentDTO dto = modelMapper.map(c, CommentDTO.class);
            dto.setUserId(c.getUser().getId());
            dto.setUserAvatarFile(c.getUser() != null ? c.getUser().getAvatarFile() : null);
            dto.setUserFullName(c.getUser().getFullName());
            dto.setParentCommentId(c.getParentComment() != null ? c.getParentComment().getId() : null);
            boolean canDelete = false;
            if (requester != null) {
                if (c.getUser() != null && c.getUser().getId().equals(requester.getId())) canDelete = true;
                else if (post.getUser() != null && post.getUser().getId().equals(requester.getId())) canDelete = true; // post owner can delete any comment
                else if (requester.getRole() == UserRole.ADMIN) canDelete = true;
                else if (requester.getRole() == UserRole.EVENT_MANAGER && post.getEvent().getCreatedBy() != null
                        && post.getEvent().getCreatedBy().getId().equals(requester.getId())) canDelete = true;
            }
            dto.setCanDelete(canDelete);
            return dto;
        }).collect(Collectors.toList());
        return dtos;
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
            dto.setUserAvatarFile(comment.getUser() != null ? comment.getUser().getAvatarFile() : null);
        dto.setPostId(comment.getPost().getId());
        dto.setParentCommentId(comment.getParentComment() != null ? comment.getParentComment().getId() : null);
        dto.setCreatedAt(comment.getCreatedAt());
        dto.setUpdatedAt(comment.getUpdatedAt());
        return dto;
    }

    // Delete comment: only allowed to comment owner OR post owner OR event manager OR admin
    public void deleteComment(Long id, String email) {
        Comment c = commentRepository.findById(id).orElseThrow(() -> new RuntimeException("Comment not found"));
        Post post = c.getPost();
        User requester = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

        boolean allowed = false;
        if (c.getUser() != null && c.getUser().getId().equals(requester.getId())) allowed = true;
        else if (post.getUser() != null && post.getUser().getId().equals(requester.getId())) allowed = true;
        else if (requester.getRole() == UserRole.ADMIN) allowed = true;
        else if (requester.getRole() == UserRole.EVENT_MANAGER && post.getEvent().getCreatedBy() != null
                && post.getEvent().getCreatedBy().getId().equals(requester.getId())) allowed = true;

        if (!allowed) throw new RuntimeException("Không có quyền xoá bình luận này");

        deleteRecursively(c);
    }

    private void deleteRecursively(Comment comment) {
        List<Comment> children = commentRepository.findByParentComment(comment);
        for (Comment child : children) {
            deleteRecursively(child);
        }
        commentRepository.delete(comment);
    }
}
