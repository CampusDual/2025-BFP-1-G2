package com.campusdual.bfp.controller;

import com.campusdual.bfp.api.ITagService;
import com.campusdual.bfp.auth.JWTUtil;
import com.campusdual.bfp.model.dto.CandidateTagsDTO;
import com.campusdual.bfp.model.dto.OfferTagsDTO;
import com.campusdual.bfp.model.dto.TagDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/tags")
public class TagController {

    @Autowired
    private ITagService tagService;

    @Autowired
    JWTUtil jwtUtils;

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping("/add")
    public ResponseEntity<Long> addTag(@RequestBody TagDTO tag) {
        long idNewTag = tagService.addTag(tag.getName());
        return ResponseEntity.ok(idNewTag);
    }

    @GetMapping("/list")
    public ResponseEntity<List<TagDTO>> listTags() {
        List<TagDTO> tags = tagService.getAllTags();
        return ResponseEntity.ok(tags);
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @DeleteMapping("/{tagId}")
    public ResponseEntity<Long> deleteTag(@PathVariable("tagId") long tagId) {
        long deletedId = tagService.deleteTag(tagId);
        return ResponseEntity.ok(deletedId);
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PutMapping("")
    public ResponseEntity<Long> editTag(@RequestBody TagDTO tag) {
        long updatedId = tagService.updateTag(tag.getId(), tag.getName());
        return ResponseEntity.ok(updatedId);
    }

    @PreAuthorize("hasRole('ROLE_COMPANY')")
    @PostMapping("/{offerId}")
    public ResponseEntity<Integer> addTagsToOffer(
            @PathVariable("offerId") int offerId,
            @RequestBody OfferTagsDTO request,
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader) {
        String token = authHeader.substring(7);
        String username = jwtUtils.getUsernameFromToken(token);
        int result = tagService.addTagsToOffer(offerId, request.getTagIds(), username);
        return ResponseEntity.ok(result);
    }

    @PreAuthorize("hasRole('ROLE_COMPANY')")
    @DeleteMapping("/{offerId}/{tagId}")
    public ResponseEntity<Integer> removeTagFromOffer(
            @PathVariable("offerId") int offerId,
            @PathVariable("tagId") long tagId,
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader) {
        String token = authHeader.substring(7);
        String username = jwtUtils.getUsernameFromToken(token);

        int result = tagService.removeTagFromOffer(offerId, tagId, username);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{offerId}")
    public ResponseEntity<List<TagDTO>> getOfferTags(@PathVariable("offerId") int offerId) {
        List<TagDTO> tags = tagService.getOfferTags(offerId);
        return ResponseEntity.ok(tags);
    }

    @PreAuthorize("hasRole('ROLE_COMPANY')")
    @PutMapping("/{offerId}")
    public ResponseEntity<Integer> replaceOfferTags(
            @PathVariable("offerId") int offerId,
            @RequestBody OfferTagsDTO request,
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader) {

        String token = authHeader.substring(7);
        String username = jwtUtils.getUsernameFromToken(token);

        int result = tagService.replaceOfferTags(offerId, request.getTagIds(), username);
        return ResponseEntity.ok(result);
    }

    @PreAuthorize("hasRole('ROLE_CANDIDATE')")
    @GetMapping("/candidate")
    public ResponseEntity<List<TagDTO>> getCandidateTags(Principal principal) {
        List<TagDTO> tags = tagService.getCandidateTags(principal.getName());
        return ResponseEntity.ok(tags);
    }

    @PreAuthorize("hasRole('ROLE_CANDIDATE')")
    @PutMapping("/candidate")
    public ResponseEntity<Integer> updateCandidateTags(
            @RequestBody CandidateTagsDTO request, Principal principal){
        int result = tagService.updateCandidateTags(request.getTagIds(), principal.getName());
        return ResponseEntity.ok(result);
    }

    @PreAuthorize("hasRole('ROLE_CANDIDATE')")
    @DeleteMapping("/candidate/{tagId}")
    public ResponseEntity<Integer> deleteCandidateTag(
            @PathVariable("tagId") int tagId, Principal principal) {
        int result = tagService.deleteCandidateTag(tagId, principal.getName());
        return ResponseEntity.ok(result);
    }

}
