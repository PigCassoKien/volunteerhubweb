package com.example.volunteerhub.service;

import com.example.volunteerhub.dto.ReactionDTO;
import com.example.volunteerhub.entity.Comment;
import com.example.volunteerhub.entity.Post;
import com.example.volunteerhub.entity.Reaction;
import com.example.volunteerhub.entity.User;
import com.example.volunteerhub.entity.enums.RelatedType;
import com.example.volunteerhub.repository.CommentRepository;
import com.example.volunteerhub.repository.PostRepository;
import com.example.volunteerhub.repository.ReactionRepository;
import com.example.volunteerhub.repository.UserRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReactionService {

    @Autowired
    private ReactionRepository reactionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private EventRegistrationService registrationService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private ModelMapper modelMapper;

    private boolean isEventManagerOrApprovedParticipant(Long eventId, User user) {
        if (user == null) return false;
        // manager check
        if (user.getRole() != null && user.getRole().toString().contains("EVENT_MANAGER")) {
            return true; // role-level fast path (Event createdBy check below for stricter equality)
        }
        // registration check
        return registrationService.hasApproveRegistration(eventId, user.getId());
    }

    // Create or toggle/update reaction: ensure one reaction per user per target
    public ReactionDTO addReaction(ReactionDTO reactionDTO, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // permission: must be participant or manager for the event
        Long targetEventId = null;
        if (reactionDTO.getPostId() != null) {
            Post post = postRepository.findById(reactionDTO.getPostId())
                    .orElseThrow(() -> new RuntimeException("Post not found"));
            targetEventId = post.getEvent().getId();
        } else if (reactionDTO.getCommentId() != null) {
            Comment comment = commentRepository.findById(reactionDTO.getCommentId())
                    .orElseThrow(() -> new RuntimeException("Comment not found"));
            targetEventId = comment.getPost().getEvent().getId();
        } else {
            throw new RuntimeException("Invalid reaction target");
        }

        if (!isEventManagerOrApprovedParticipant(targetEventId, user)) {
            throw new RuntimeException("Unauthorized to react");
        }

        // handle post reaction
        if (reactionDTO.getPostId() != null) {
            Long postId = reactionDTO.getPostId();
            Reaction existing = reactionRepository.findByPostIdAndUserId(postId, user.getId()).orElse(null);

            if (existing != null) {
                // same type => toggle off (delete)
                if (existing.getReactionType() == reactionDTO.getReactionType()) {
                    reactionRepository.delete(existing);
                    return null;
                }
                // different type => update
                existing.setReactionType(reactionDTO.getReactionType());
                existing.setUpdatedAt(LocalDateTime.now());
                existing = reactionRepository.save(existing);
                return modelMapper.map(existing, ReactionDTO.class);
            } else {
                Reaction r = new Reaction();
                r.setUser(user);
                Post post = postRepository.findById(postId).orElseThrow(() -> new RuntimeException("Post not found"));
                r.setPost(post);
                r.setReactionType(reactionDTO.getReactionType());
                r.setCreatedAt(LocalDateTime.now());
                r = reactionRepository.save(r);
                // notify post owner (optional)
                notificationService.notifyReaction(post.getUser().getId(), post.getId(), RelatedType.POST, r.getReactionType());
                return modelMapper.map(r, ReactionDTO.class);
            }
        }

        // handle comment reaction
        if (reactionDTO.getCommentId() != null) {
            Long commentId = reactionDTO.getCommentId();
            Reaction existing = reactionRepository.findByCommentIdAndUserId(commentId, user.getId()).orElse(null);

            if (existing != null) {
                if (existing.getReactionType() == reactionDTO.getReactionType()) {
                    reactionRepository.delete(existing);
                    return null;
                }
                existing.setReactionType(reactionDTO.getReactionType());
                existing.setUpdatedAt(LocalDateTime.now());
                existing = reactionRepository.save(existing);
                return modelMapper.map(existing, ReactionDTO.class);
            } else {
                Reaction r = new Reaction();
                r.setUser(user);
                Comment comment = commentRepository.findById(commentId).orElseThrow(() -> new RuntimeException("Comment not found"));
                r.setComment(comment);
                r.setReactionType(reactionDTO.getReactionType());
                r.setCreatedAt(LocalDateTime.now());
                r = reactionRepository.save(r);
                notificationService.notifyReaction(comment.getUser().getId(), comment.getId(), RelatedType.COMMENT, r.getReactionType());
                return modelMapper.map(r, ReactionDTO.class);
            }
        }

        throw new RuntimeException("Invalid reaction target");
    }

    // Read
    public ReactionDTO getReactionById(Long id, String email) {
        Reaction reaction = reactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reaction not found"));

        // allow if requester is in the same event (post/comment -> event)
        Long eventId = null;
        if (reaction.getPost() != null) {
            eventId = reaction.getPost().getEvent().getId();
        } else if (reaction.getComment() != null) {
            eventId = reaction.getComment().getPost().getEvent().getId();
        }

        if (eventId != null) {
            User requester = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            boolean isManager = reaction.getPost() != null
                    ? reaction.getPost().getEvent().getCreatedBy() != null && reaction.getPost().getEvent().getCreatedBy().getId().equals(requester.getId())
                    : reaction.getComment().getPost().getEvent().getCreatedBy() != null && reaction.getComment().getPost().getEvent().getCreatedBy().getId().equals(requester.getId());

            boolean isParticipant = registrationService.hasApproveRegistration(eventId, requester.getId());

            if (!isManager && !isParticipant) {
                throw new RuntimeException("Forbidden: cannot view reaction");
            }
        }

        return modelMapper.map(reaction, ReactionDTO.class);
    }

    public List<ReactionDTO> getReactionsByPost(Long postId, String email) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        Long eventId = post.getEvent().getId();

        User requester = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean isManager = post.getEvent().getCreatedBy() != null && post.getEvent().getCreatedBy().getId().equals(requester.getId());
        boolean isParticipant = registrationService.hasApproveRegistration(eventId, requester.getId());

        if (!isManager && !isParticipant) {
            throw new RuntimeException("Forbidden: cannot view reactions for this post");
        }

        return reactionRepository.findByPostId(postId).stream()
                .map(r -> modelMapper.map(r, ReactionDTO.class))
                .collect(Collectors.toList());
    }

    public List<ReactionDTO> getReactionsByComment(Long commentId, String email) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        Long eventId = comment.getPost().getEvent().getId();

        User requester = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean isManager = comment.getPost().getEvent().getCreatedBy() != null && comment.getPost().getEvent().getCreatedBy().getId().equals(requester.getId());
        boolean isParticipant = registrationService.hasApproveRegistration(eventId, requester.getId());

        if (!isManager && !isParticipant) {
            throw new RuntimeException("Forbidden: cannot view reactions for this comment");
        }

        return reactionRepository.findByCommentId(commentId).stream()
                .map(r -> modelMapper.map(r, ReactionDTO.class))
                .collect(Collectors.toList());
    }

    // Update
    public ReactionDTO updateReaction(Long id, ReactionDTO reactionDTO, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Reaction reaction = reactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reaction not found"));

        if (!reaction.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized: only reaction owner can update");
        }

        reaction.setReactionType(reactionDTO.getReactionType());
        reaction.setUpdatedAt(LocalDateTime.now());
        reaction = reactionRepository.save(reaction);
        return modelMapper.map(reaction, ReactionDTO.class);
    }

    // Delete
    public void deleteReaction(Long id, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Reaction reaction = reactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reaction not found"));
        if (!reaction.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized: only reaction owner can delete");
        }
        reactionRepository.deleteById(id);
    }
}
