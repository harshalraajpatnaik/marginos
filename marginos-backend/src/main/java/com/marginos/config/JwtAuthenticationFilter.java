package com.marginos.config;

import com.marginos.apikey.model.ApiKey;
import com.marginos.apikey.service.ApiKeyService;
import com.marginos.auth.service.CustomUserDetailsService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider tokenProvider;
    private final CustomUserDetailsService userDetailsService;
    private final ApiKeyService apiKeyService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        try {
            // 1. Check API Key header
            String apiKeyHeader = request.getHeader("X-API-Key");
            if (StringUtils.hasText(apiKeyHeader) && apiKeyHeader.startsWith("mk_live_")) {
                Optional<ApiKey> apiKeyOpt = apiKeyService.validateAndTouchKey(apiKeyHeader);
                if (apiKeyOpt.isPresent()) {
                    ApiKey apiKey = apiKeyOpt.get();
                    List<SimpleGrantedAuthority> authorities = Arrays.stream(apiKey.getScopes().split(","))
                            .map(String::trim)
                            .map(scope -> new SimpleGrantedAuthority("SCOPE_" + scope))
                            .collect(Collectors.toList());
                    authorities.add(new SimpleGrantedAuthority("ROLE_API_CLIENT"));

                    // Store business id in request attribute for multi-tenancy validation
                    request.setAttribute("API_KEY_BUSINESS_ID", apiKey.getBusiness().getId());
                    request.setAttribute("API_KEY_SCOPES", apiKey.getScopes());

                    UserDetails userDetails = null;
                    if (apiKey.getCreatedBy() != null) {
                        try {
                            userDetails = userDetailsService.loadUserById(apiKey.getCreatedBy().getId());
                        } catch (Exception e) {
                            log.debug("Could not load user details for API key creator", e);
                        }
                    }

                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(userDetails != null ? userDetails : apiKey.getPrefix(), null, authorities);
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authentication);

                    filterChain.doFilter(request, response);
                    return;
                }
            }

            // 2. Check JWT Bearer token
            String jwt = getJwtFromRequest(request);
            if (StringUtils.hasText(jwt) && tokenProvider.validateToken(jwt)) {
                UUID userId = tokenProvider.getUserIdFromToken(jwt);
                UserDetails userDetails = userDetailsService.loadUserById(userId);

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception ex) {
            log.error("Could not set user authentication in security context", ex);
        }

        filterChain.doFilter(request, response);
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
