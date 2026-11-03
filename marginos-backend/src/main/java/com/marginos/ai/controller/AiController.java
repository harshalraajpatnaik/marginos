package com.marginos.ai.controller;

import com.marginos.ai.dto.AiDto.*;
import com.marginos.ai.service.AiService;
import com.marginos.auth.service.UserPrincipal;
import com.marginos.business.service.BusinessService;
import com.marginos.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/businesses/{businessId}/ai")
@RequiredArgsConstructor
@Tag(name = "AI Business Assistant", description = "Plain-language financial explanations grounded in deterministic backend calculations")
public class AiController {

    private final AiService aiService;
    private final BusinessService businessService;

    @PostMapping("/ask")
    @Operation(summary = "Ask the business assistant to analyze margins, cash flow, break-even, or inventory")
    public ResponseEntity<ApiResponse<AskAiResponse>> askAssistant(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID businessId,
            @Valid @RequestBody AskAiRequest request) {
        businessService.verifyMembership(principal.getId(), businessId);
        return ResponseEntity.ok(ApiResponse.ok(aiService.askAssistant(businessId, request)));
    }
}
