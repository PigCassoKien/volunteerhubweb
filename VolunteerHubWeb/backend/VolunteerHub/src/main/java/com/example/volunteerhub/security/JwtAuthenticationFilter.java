package com.example.volunteerhub.security;

import com.example.volunteerhub.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import com.example.volunteerhub.repository.UserRepository;
import com.example.volunteerhub.entity.User;
import com.example.volunteerhub.entity.enums.UserStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");
        String token = null;
        String username = null;

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
            try {
                username = jwtService.extractClaims(token).getSubject();
            } catch (Exception e) {
                username = null;
            }
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            // If user exists but is banned, reject immediately
            try {
                User u = userRepository.findByEmail(username).orElse(null);
                if (u != null && u.getStatus() == UserStatus.BANNED) {
                    response.sendError(HttpServletResponse.SC_FORBIDDEN, "Account locked");
                    return;
                }
            } catch (Exception ignore) {
            }

            UserDetails userDetails = userDetailsService.loadUserByUsername(username);
            boolean isTokenValid = false;
            try {
                isTokenValid = !jwtService.extractClaims(token).getExpiration().before(new java.util.Date());
            } catch (Exception e) {
                isTokenValid = false;
            }
            if (isTokenValid) {
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }
        filterChain.doFilter(request, response);
    }
}