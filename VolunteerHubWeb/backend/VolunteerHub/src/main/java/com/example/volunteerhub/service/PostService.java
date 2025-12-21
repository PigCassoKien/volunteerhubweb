package com.example.volunteerhub.service;

import com.example.volunteerhub.dto.PostDTO;
import com.example.volunteerhub.entity.Comment;
import com.example.volunteerhub.entity.Event;
import com.example.volunteerhub.entity.Post;
import com.example.volunteerhub.entity.User;
import com.example.volunteerhub.entity.enums.PostStatus;
import com.example.volunteerhub.entity.enums.UserRole;
import com.example.volunteerhub.repository.CommentRepository;
import com.example.volunteerhub.repository.EventRepository;
import com.example.volunteerhub.repository.PostRepository;
import com.example.volunteerhub.repository.ReactionRepository;
import com.example.volunteerhub.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.Comparator;
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
    private ModelMapper modelMapper;

    @Autowired
    private EventRegistrationService registrationService;

    @Autowired
    private ReactionRepository reactionRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Value("${upload.dir:uploads}")
    private String uploadDir;

    private Path getPostBaseDir() {
        try {
            Path base = Path.of(uploadDir).toAbsolutePath().normalize();
            if (!Files.exists(base)) Files.createDirectories(base);
            return base;
        } catch (Exception ex) {
            throw new RuntimeException("Cannot access upload dir", ex);
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
            throw new RuntimeException("Không có quyền đăng bài trong kênh trao đổi này");
        }

        Post post = new Post();
        post.setEvent(event);
        post.setUser(user);
        post.setContent(postDTO.getContent());
        post.setMediaFiles(postDTO.getMediaFiles());
        post.setCreatedAt(LocalDateTime.now());

        post.setStatus(isManagerOfEvent ? PostStatus.APPROVED : PostStatus.PENDING);

        post = postRepository.save(post);

        PostDTO dto = modelMapper.map(post, PostDTO.class);
        dto.setUserId(user.getId());
        dto.setUserFullName(user.getFullName());
        dto.setUserAvatarFile(user.getAvatarFile());
        dto.setCanDelete(true);
        return dto;
    }

    public PostDTO getPostById(Long id, String email) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        User requester = (email == null)
                ? null
                : userRepository.findByEmail(email).orElse(null);

        if (post.getStatus() != PostStatus.APPROVED) {
            if (requester == null) {
                throw new RuntimeException("Post not available");
            }
            boolean isOwner = post.getUser() != null && post.getUser().getId().equals(requester.getId());
            boolean isEventManager = post.getEvent() != null
                    && post.getEvent().getCreatedBy() != null
                    && post.getEvent().getCreatedBy().getId().equals(requester.getId());
            boolean isAdmin = requester.getRole() == UserRole.ADMIN;

            if (!isOwner && !isEventManager && !isAdmin) {
                throw new RuntimeException("Post not available");
            }
        }

        PostDTO dto = modelMapper.map(post, PostDTO.class);
        dto.setUserId(post.getUser() != null ? post.getUser().getId() : null);
        dto.setUserFullName(post.getUser() != null ? post.getUser().getFullName() : null);
        dto.setUserAvatarFile(post.getUser() != null ? post.getUser().getAvatarFile() : null);

        boolean canDelete = false;
        if (requester != null) {
            boolean isOwner = post.getUser() != null && post.getUser().getId().equals(requester.getId());
            boolean isEventManager = post.getEvent() != null
                    && post.getEvent().getCreatedBy() != null
                    && post.getEvent().getCreatedBy().getId().equals(requester.getId());
            boolean isAdmin = requester.getRole() == UserRole.ADMIN;
            canDelete = isOwner || isEventManager || isAdmin;
        }
        dto.setCanDelete(canDelete);
        return dto;
    }

    public List<PostDTO> getPostsByEvent(Long eventId, String requesterEmail) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        User requester;
        if (requesterEmail != null) {
            requester = userRepository.findByEmail(requesterEmail).orElse(null);
        } else {
            requester = null;
        }

        List<Post> all = postRepository.findByEventId(eventId);

        return all.stream()
                .filter(p -> {
                    if (p.getStatus() == PostStatus.APPROVED) return true;

                    if (requester == null) return false;

                    boolean isOwner = p.getUser() != null && p.getUser().getId().equals(requester.getId());
                    boolean isEventManager = event.getCreatedBy() != null
                            && event.getCreatedBy().getId().equals(requester.getId());
                    boolean isAdmin = requester.getRole() == UserRole.ADMIN;

                    return isOwner || isEventManager || isAdmin;
                })
                .sorted(Comparator.comparing(
                        Post::getCreatedAt,
                        Comparator.nullsLast(Comparator.reverseOrder())
                ))
                .map(p -> {
                    PostDTO dto = modelMapper.map(p, PostDTO.class);
                    dto.setUserId(p.getUser() != null ? p.getUser().getId() : null);
                    dto.setUserFullName(p.getUser() != null ? p.getUser().getFullName() : null);
                    dto.setUserAvatarFile(p.getUser() != null ? p.getUser().getAvatarFile() : null);

                    boolean canDelete = false;
                    if (requester != null) {
                        boolean isOwner = p.getUser() != null && p.getUser().getId().equals(requester.getId());
                        boolean isEventManager = event.getCreatedBy() != null
                                && event.getCreatedBy().getId().equals(requester.getId());
                        boolean isAdmin = requester.getRole() == UserRole.ADMIN;
                        canDelete = isOwner || isEventManager || isAdmin;
                    }
                    dto.setCanDelete(canDelete);
                    return dto;
                })
                .collect(Collectors.toList());
    }

    public PostDTO updatePostMultipart(Long postId, String content, MultipartFile[] mediaFiles, String email) {
        Post post = postRepository.findById(postId).orElseThrow(() -> new RuntimeException("Post not found"));
        User requester = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

        boolean allowed = (post.getUser() != null && post.getUser().getId().equals(requester.getId()))
                || requester.getRole() == UserRole.ADMIN
                || (requester.getRole() == UserRole.EVENT_MANAGER && post.getEvent().getCreatedBy() != null
                    && post.getEvent().getCreatedBy().getId().equals(requester.getId()));
        if (!allowed) throw new RuntimeException("Không có quyền cập nhật bài viết");

        if (content != null) post.setContent(content);
        if (mediaFiles != null && mediaFiles.length > 0) {
            try {
                Path base = getPostBaseDir();
                for (MultipartFile mf : mediaFiles) {
                    String fname = System.currentTimeMillis() + "_" + mf.getOriginalFilename();
                    Path target = base.resolve(fname).normalize();
                    Files.copy(mf.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
                    post.getMediaFiles().add(fname);
                }
            } catch (Exception ex) {
                throw new RuntimeException("Lưu file thất bại: " + ex.getMessage());
            }
        }
        post.setUpdatedAt(LocalDateTime.now());
        post = postRepository.save(post);
        PostDTO dto = modelMapper.map(post, PostDTO.class);
        dto.setUserId(post.getUser() != null ? post.getUser().getId() : null);
        dto.setUserFullName(post.getUser() != null ? post.getUser().getFullName() : null);
        dto.setUserAvatarFile(post.getUser() != null ? post.getUser().getAvatarFile() : null);
        boolean canDelete = false;
        if (requester != null) {
            if (post.getUser() != null && post.getUser().getId().equals(requester.getId())) canDelete = true;
            else if (requester.getRole() == UserRole.ADMIN) canDelete = true;
            else if (requester.getRole() == UserRole.EVENT_MANAGER && post.getEvent().getCreatedBy() != null
                    && post.getEvent().getCreatedBy().getId().equals(requester.getId())) canDelete = true;
        }
        dto.setCanDelete(canDelete);
        return dto;
    }

    @Transactional
    public void deletePost(Long postId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        boolean isOwner = post.getUser() != null && post.getUser().getId().equals(user.getId());
        boolean isEventManager = post.getEvent() != null
                && post.getEvent().getCreatedBy() != null
                && post.getEvent().getCreatedBy().getId().equals(user.getId());
        boolean isAdmin = user.getRole() == UserRole.ADMIN;

        if (!isOwner && !isEventManager && !isAdmin) {
            throw new RuntimeException("Unauthorized");
        }

        List<Comment> comments = commentRepository.findByPostId(postId);
        for (Comment c : comments) {
            reactionRepository.deleteByCommentId(c.getId());
        }

        reactionRepository.deleteByPostId(postId);

        if (!comments.isEmpty()) {
            commentRepository.deleteAll(comments);
        }

        postRepository.delete(post);
    }

    public PostDTO approvePost(Long postId, String email) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        Event event = post.getEvent();

        User requester = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean isManagerOfEvent = requester.getRole() == UserRole.EVENT_MANAGER
                && event.getCreatedBy() != null
                && requester.getId().equals(event.getCreatedBy().getId());
        boolean isAdmin = requester.getRole() == UserRole.ADMIN;

        if (!isManagerOfEvent && !isAdmin) {
            throw new RuntimeException("Unauthorized");
        }

        post.setStatus(PostStatus.APPROVED);
        postRepository.save(post);

        PostDTO dto = modelMapper.map(post, PostDTO.class);
        dto.setUserId(post.getUser() != null ? post.getUser().getId() : null);
        dto.setUserFullName(post.getUser() != null ? post.getUser().getFullName() : null);
        dto.setUserAvatarFile(post.getUser() != null ? post.getUser().getAvatarFile() : null);
        dto.setCanDelete(true);
        return dto;
    }

    public PostDTO rejectPost(Long postId, String email) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        Event event = post.getEvent();

        User requester = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean isManagerOfEvent = requester.getRole() == UserRole.EVENT_MANAGER
                && event.getCreatedBy() != null
                && requester.getId().equals(event.getCreatedBy().getId());
        boolean isAdmin = requester.getRole() == UserRole.ADMIN;

        if (!isManagerOfEvent && !isAdmin) {
            throw new RuntimeException("Unauthorized");
        }

        post.setStatus(PostStatus.REJECTED);
        postRepository.save(post);

        PostDTO dto = modelMapper.map(post, PostDTO.class);
        dto.setUserId(post.getUser() != null ? post.getUser().getId() : null);
        dto.setUserFullName(post.getUser() != null ? post.getUser().getFullName() : null);
        dto.setUserAvatarFile(post.getUser() != null ? post.getUser().getAvatarFile() : null);
        dto.setCanDelete(false);
        return dto;
    }

    public PostDTO deletePostMedia(Long postId, String mediaPath, String email) {
        Post post = postRepository.findById(postId).orElseThrow(() -> new RuntimeException("Post not found"));
        User requester = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

        boolean allowed = false;
        if (post.getUser() != null && post.getUser().getId().equals(requester.getId())) allowed = true;
        else if (requester.getRole() == UserRole.ADMIN) allowed = true;
        else if (requester.getRole() == UserRole.EVENT_MANAGER && post.getEvent().getCreatedBy() != null
                && post.getEvent().getCreatedBy().getId().equals(requester.getId())) allowed = true;

        if (!allowed) throw new RuntimeException("Không có quyền xoá media của bài viết");

        if (post.getMediaFiles() == null || !post.getMediaFiles().contains(mediaPath)) {
            throw new RuntimeException("Media không tồn tại trong bài viết");
        }

        post.getMediaFiles().removeIf(m -> m.equals(mediaPath));
        postRepository.save(post);

        try {
            Path base = getPostBaseDir();
            Path target = base.resolve(mediaPath).normalize();
            if (Files.exists(target)) {
                Files.delete(target);
            }
        } catch (Exception ex) {
            System.err.println("[PostService] Failed to delete media file: " + ex.getMessage());
        }
        return null;
    }
}