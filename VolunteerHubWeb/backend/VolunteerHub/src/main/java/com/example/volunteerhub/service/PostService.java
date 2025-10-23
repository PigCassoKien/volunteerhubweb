package com.example.volunteerhub.service;

import com.example.volunteerhub.dto.PostDTO;
import com.example.volunteerhub.entity.Event;
import com.example.volunteerhub.entity.Post;
import com.example.volunteerhub.entity.User;
import com.example.volunteerhub.entity.enums.PostStatus;
import com.example.volunteerhub.entity.enums.UserRole;
import com.example.volunteerhub.repository.EventRepository;
import com.example.volunteerhub.repository.PostRepository;
import com.example.volunteerhub.repository.UserRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PostService {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private EventRegistrationService registrationService;

    @Autowired
    private ModelMapper modelMapper;

    // Create
    public PostDTO createPost(PostDTO postDTO, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Event event = eventRepository.findById(postDTO.getEventId())
                .orElseThrow(() -> new RuntimeException("Event not found"));

        boolean isManagerOfEvent = user.getRole() == UserRole.EVENT_MANAGER
                && event.getCreatedBy() != null
                && email.equals(event.getCreatedBy().getEmail());

        boolean isApprovedVolunteer = registrationService.hasApproveRegistration(event.getId(), user.getId());

        if (!isManagerOfEvent && !isApprovedVolunteer) {
            throw new RuntimeException("Forbidden: only event manager or approved volunteers can post");
        }

        Post post = new Post();
        post.setEvent(event);
        post.setUser(user);
        post.setContent(postDTO.getContent());
        post.setMediaFiles(postDTO.getMediaFiles());
        // Auto-approve if created by event manager, otherwise keep pending for manager approval
        post.setStatus(isManagerOfEvent ? PostStatus.APPROVED : PostStatus.PENDING);
        post.setCreatedAt(LocalDateTime.now());
        if (isManagerOfEvent) {
            post.setUpdatedAt(LocalDateTime.now());
        }

        post = postRepository.save(post);

        return modelMapper.map(post, PostDTO.class);
    }

    // Read
    public PostDTO getPostById(Long id, String email) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        User requester = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Event event = post.getEvent();

        boolean isManagerOfEvent = requester.getRole() == UserRole.EVENT_MANAGER
                && event.getCreatedBy() != null
                && email.equals(event.getCreatedBy().getEmail());

        boolean isApprovedVolunteer = registrationService.hasApproveRegistration(event.getId(), requester.getId());

        if (!isManagerOfEvent && !isApprovedVolunteer) {
            throw new RuntimeException("Forbidden: cannot view this post");
        }

        return modelMapper.map(post, PostDTO.class);
    }

    public List<PostDTO> getPostsByEvent(Long eventId, String email) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        User requester = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean isManagerOfEvent = requester.getRole() == UserRole.EVENT_MANAGER
                && event.getCreatedBy() != null
                && email.equals(event.getCreatedBy().getEmail());

        boolean isApprovedVolunteer = registrationService.hasApproveRegistration(eventId, requester.getId());

        if (!isManagerOfEvent && !isApprovedVolunteer) {
            throw new RuntimeException("Forbidden: cannot view posts for this event");
        }

        return postRepository.findByEventId(eventId).stream()
                .map(post -> modelMapper.map(post, PostDTO.class))
                .collect(Collectors.toList());
    }

    // Update
    public PostDTO updatePost(Long id, PostDTO postDTO, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        if (!post.getUser().getEmail().equals(email)) {
            throw new RuntimeException("Unauthorized: only the author can update the post");
        }

        if (postDTO.getContent() != null) post.setContent(postDTO.getContent());
        if (postDTO.getMediaFiles() != null) post.setMediaFiles(postDTO.getMediaFiles());

        // After edit, mark pending for re-approval
        post.setStatus(PostStatus.PENDING);
        post.setUpdatedAt(LocalDateTime.now());

        post = postRepository.save(post);
        return modelMapper.map(post, PostDTO.class);
    }

    // Delete
    public void deletePost(Long id, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        Event event = post.getEvent();

        boolean isAuthor = post.getUser() != null && email.equals(post.getUser().getEmail());
        boolean isManagerOfEvent = user.getRole() == UserRole.EVENT_MANAGER
                && event.getCreatedBy() != null
                && email.equals(event.getCreatedBy().getEmail());

        if (!isAuthor && !isManagerOfEvent) {
            throw new RuntimeException("Unauthorized: cannot delete post");
        }

        postRepository.deleteById(id);
    }

    public PostDTO approvePost(Long postId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        Event event = post.getEvent();

        if (user.getRole() != UserRole.EVENT_MANAGER
                || event.getCreatedBy() == null
                || !email.equals(event.getCreatedBy().getEmail())) {
            throw new RuntimeException("Unauthorized: only event manager can approve posts");
        }

        post.setStatus(PostStatus.APPROVED);
        post.setUpdatedAt(LocalDateTime.now());
        post = postRepository.save(post);

        // optional: notify author about approval
        // notificationService.notifyPostStatusChange(post.getUser().getId(), postId, PostStatus.APPROVED);

        return modelMapper.map(post, PostDTO.class);
    }
}