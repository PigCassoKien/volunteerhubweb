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

    // Create
    public ReactionDTO addReaction(ReactionDTO reactionDTO, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (reactionDTO.getPostId() == null && reactionDTO.getCommentId() == null) {
            throw new RuntimeException("postId or commentId is required");
        }

        Reaction reaction = new Reaction();
        reaction.setUser(user);
        reaction.setReactionType(reactionDTO.getReactionType());
        reaction.setCreatedAt(LocalDateTime.now());

        if (reactionDTO.getPostId() != null) {
            Post post = postRepository.findById(reactionDTO.getPostId())
                    .orElseThrow(() -> new RuntimeException("Post not found"));
            Long eventId = post.getEvent().getId();

            boolean isManager = post.getEvent().getCreatedBy() != null
                    && post.getEvent().getCreatedBy().getId().equals(user.getId());
            boolean isParticipant = registrationService.hasApproveRegistration(eventId, user.getId());

            if (!isManager && !isParticipant) {
                throw new RuntimeException("Unauthorized to react to this post");
            }
            reaction.setPost(post);
            reaction = reactionRepository.save(reaction);

            notificationService.notifyReaction(post.getUser().getId(), post.getId(), RelatedType.POST, reaction.getReactionType());
        } else {
            Comment comment = commentRepository.findById(reactionDTO.getCommentId())
                    .orElseThrow(() -> new RuntimeException("Comment not found"));
            Post post = comment.getPost();
            Long eventId = post.getEvent().getId();

            boolean isManager = post.getEvent().getCreatedBy() != null
                    && post.getEvent().getCreatedBy().getId().equals(user.getId());
            boolean isParticipant = registrationService.hasApproveRegistration(eventId, user.getId());

            if (!isManager && !isParticipant) {
                throw new RuntimeException("Unauthorized to react to this comment");
            }
            reaction.setComment(comment);
            reaction = reactionRepository.save(reaction);

            notificationService.notifyReaction(comment.getUser().getId(), comment.getId(), RelatedType.COMMENT, reaction.getReactionType());
        }

        return modelMapper.map(reaction, ReactionDTO.class);
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
