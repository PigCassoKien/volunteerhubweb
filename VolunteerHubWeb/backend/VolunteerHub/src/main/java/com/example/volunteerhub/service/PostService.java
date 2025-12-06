package com.example.volunteerhub.service;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.example.volunteerhub.dto.PostDTO;
import com.example.volunteerhub.entity.Event;
import com.example.volunteerhub.entity.Post;
import com.example.volunteerhub.entity.User;
import com.example.volunteerhub.entity.enums.PostStatus;
import com.example.volunteerhub.entity.enums.UserRole;
import com.example.volunteerhub.repository.EventRepository;
import com.example.volunteerhub.repository.PostRepository;
import com.example.volunteerhub.repository.UserRepository;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class PostService {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    private EventRegistrationService registrationService;

    @Value("${upload.dir:uploads}")
    private String uploadDir;

    private Path getPostBaseDir() {
        try {
            Path base = Path.of(uploadDir != null && !uploadDir.isBlank() ? uploadDir : "uploads")
                    .toAbsolutePath().normalize()
                    .resolve("post");
            Files.createDirectories(base);
            return base;
        } catch (Exception ex) {
            throw new RuntimeException("Unable to prepare upload folder: " + ex.getMessage(), ex);
        }
    }

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
        PostDTO out = modelMapper.map(post, PostDTO.class);
        out.setUserFullName(post.getUser() != null ? post.getUser().getFullName() : null);
        out.setUserId(post.getUser() != null ? post.getUser().getId() : null);
        return out;
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

        List<Post> posts = postRepository.findByEventId(eventId);

        Stream<Post> stream = posts.stream();
        if (!isManagerOfEvent) {
            // show APPROVED posts for everyone + allow requester to see their own (even if PENDING)
            stream = stream.filter(p -> p.getStatus() == PostStatus.APPROVED || (p.getUser() != null && p.getUser().getId().equals(requester.getId())));
        }

        return stream
                .sorted(Comparator.comparing(Post::getCreatedAt).reversed())
                .map(p -> {
                    PostDTO dto = modelMapper.map(p, PostDTO.class);
                    dto.setUserFullName(p.getUser() != null ? p.getUser().getFullName() : null);
                    dto.setUserId(p.getUser() != null ? p.getUser().getId() : null);
                    return dto;
                })
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

    // Update multipart: append new uploaded files when provided (do not silently ignore)
    public PostDTO updatePostMultipart(Long postId, String content, MultipartFile[] mediaFiles, String email) {
        Post post = postRepository.findById(postId).orElseThrow(() -> new RuntimeException("Post not found"));
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        boolean isManager = post.getEvent().getCreatedBy() != null && post.getEvent().getCreatedBy().getEmail().equals(email);
        if (!isManager && !post.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        if (content != null) post.setContent(content);

        if (mediaFiles != null && mediaFiles.length > 0) {
            List<String> saved = new ArrayList<>();
            Path base = getPostBaseDir();
            for (MultipartFile f : mediaFiles) {
                if (f == null || f.isEmpty()) continue;
                String original = Path.of(f.getOriginalFilename()).getFileName().toString();
                String filename = System.currentTimeMillis() + "_" + original.replaceAll("[^a-zA-Z0-9._-]", "_");
                Path target = base.resolve(filename);
                try {
                    Files.copy(f.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
                    saved.add("post/" + filename);
                } catch (Exception ex) {
                    // continue with other files
                }
            }
            if (post.getMediaFiles() == null) post.setMediaFiles(new ArrayList<>());
            post.getMediaFiles().addAll(saved); // append new files
        }

        post.setUpdatedAt(LocalDateTime.now());
        post = postRepository.save(post);

        PostDTO dto = modelMapper.map(post, PostDTO.class);
        dto.setUserFullName(post.getUser() != null ? post.getUser().getFullName() : null);
        dto.setUserId(post.getUser() != null ? post.getUser().getId() : null);
        return dto;
    }

    // Delete single media file from a post (remove DB entry + delete physical file)
    public PostDTO deletePostMedia(Long postId, String filePath, String email) {
        Post post = postRepository.findById(postId).orElseThrow(() -> new RuntimeException("Post not found"));
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        boolean isManager = post.getEvent().getCreatedBy() != null && post.getEvent().getCreatedBy().getEmail().equals(email);
        if (!isManager && !post.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        if (filePath == null || filePath.isBlank()) throw new RuntimeException("File path required");

        // normalize stored path (expect "post/filename.ext")
        String normalized = filePath.replace("\\", "/");
        if (post.getMediaFiles() != null && post.getMediaFiles().removeIf(s -> s.equals(normalized))) {
            // delete physical file
            try {
                Path base = getPostBaseDir();
                // filePath may be "post/filename"
                String filename = normalized.contains("/") ? normalized.substring(normalized.indexOf("/") + 1) : normalized;
                Path target = base.resolve(filename);
                Files.deleteIfExists(target);
            } catch (Exception ex) {
                // log and continue
            }
            post = postRepository.save(post);
            PostDTO dto = modelMapper.map(post, PostDTO.class);
            dto.setUserFullName(post.getUser() != null ? post.getUser().getFullName() : null);
            dto.setUserId(post.getUser() != null ? post.getUser().getId() : null);
            return dto;
        } else {
            throw new RuntimeException("File not found in post");
        }
    }

    // Delete post: delete files from disk then remove DB row
    public void deletePost(Long id, String email) {
        Post post = postRepository.findById(id).orElseThrow(() -> new RuntimeException("Post not found"));
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        boolean isManager = post.getEvent().getCreatedBy() != null && post.getEvent().getCreatedBy().getEmail().equals(email);
        if (!isManager && !post.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        // delete files
        if (post.getMediaFiles() != null && !post.getMediaFiles().isEmpty()) {
            Path base = getPostBaseDir();
            for (String mf : new ArrayList<>(post.getMediaFiles())) {
                try {
                    String filename = mf.contains("/") ? mf.substring(mf.indexOf("/") + 1) : mf;
                    Files.deleteIfExists(base.resolve(filename));
                } catch (Exception ex) {
                    // continue
                }
            }
        }

        postRepository.delete(post);
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

    // Reject post (set status = REJECTED) - only manager of event or admin
    public PostDTO rejectPost(Long postId, String email) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean isManagerOfEvent = user.getRole() == UserRole.EVENT_MANAGER
                && post.getEvent().getCreatedBy() != null
                && post.getEvent().getCreatedBy().getEmail().equals(email);
        boolean isAdmin = user.getRole() == UserRole.ADMIN;

        if (!isManagerOfEvent && !isAdmin) {
            throw new RuntimeException("Unauthorized");
        }

        post.setStatus(PostStatus.REJECTED);
        post = postRepository.save(post);
        return modelMapper.map(post, PostDTO.class);
    }
}