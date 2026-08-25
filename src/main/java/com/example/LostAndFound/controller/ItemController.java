package com.example.LostAndFound.controller;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.LostAndFound.dto.ClaimDecisionRequest;
import com.example.LostAndFound.dto.ClaimRequest;
import com.example.LostAndFound.dto.ClaimView;
import com.example.LostAndFound.dto.ItemDetailsResponse;
import com.example.LostAndFound.dto.LostItemView;
import com.example.LostAndFound.entity.Claim;
import com.example.LostAndFound.entity.ClaimStatus;
import com.example.LostAndFound.entity.ClaimType;
import com.example.LostAndFound.entity.Item;
import com.example.LostAndFound.entity.ItemStatus;
import com.example.LostAndFound.entity.User;
import com.example.LostAndFound.repository.ClaimRepository;
import com.example.LostAndFound.repository.ItemRepository;
import com.example.LostAndFound.repository.UserRepository;
import com.example.LostAndFound.security.AuthenticatedUser;
import com.example.LostAndFound.service.ItemService;

@RestController
@RequestMapping("/api/items")
@CrossOrigin(origins = "*")
public class ItemController {

    private final ItemService itemService;
    private final ItemRepository itemRepository;
    private final UserRepository userRepository;
    private final ClaimRepository claimRepository;

   
    public ItemController(ItemService itemService, ItemRepository itemRepository, 
                         UserRepository userRepository, ClaimRepository claimRepository) {
        this.itemService = itemService;
        this.itemRepository = itemRepository;
        this.userRepository = userRepository;
        this.claimRepository = claimRepository;
    }


    @GetMapping("/lost-old")
    public List<Item> getLostItemsOld() {
        return itemRepository.findByStatus(ItemStatus.claimed);
    }

    @GetMapping("/lost")
    public List<LostItemView> getLostItems() {
        return itemRepository.findItemsWithUsernameByStatus("lost");
    }

    @GetMapping("/claimed-old")
    public List<Item> getClaimedItemsOld() {
        return itemRepository.findByStatus(ItemStatus.claimed);
    }

    @GetMapping("/claimed")
    public List<LostItemView> getClaimedItems() {
        return itemRepository.findItemsWithUsernameByStatus("claimed");
    }

    @GetMapping("/found-old")
    public List<Item> getFoundItemsOld() {
        return itemRepository.findByStatus(ItemStatus.found);
    }

    @GetMapping("/found")
    public List<LostItemView> getFoundItems() {
        return itemRepository.findItemsWithUsernameByStatus("found");
    }

    @GetMapping("/filter")
    public List<Item> filterItems(
            @RequestParam(value = "searchQuery", required = false) String searchQuery,
            @RequestParam(value = "itemType", required = false) String itemType,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "filterDate", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime filterDate) {

        return itemService.searchItems(
                searchQuery,
                itemType,
                status,
                filterDate
        );
    }

    @GetMapping("/all")
    public List<Item> getAllItems() {
        return itemRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ItemDetailsResponse> getItemById(
            @PathVariable Long id) {

        Item item = itemService.getItemById(id);

        if (item == null) {
            return ResponseEntity.notFound().build();
        }

        User reporter = userRepository
                .findById(item.getUserId())
                .orElse(null);

        ItemDetailsResponse response = new ItemDetailsResponse(
                item.getItemId(),
                item.getItemName(),
                item.getItemType(),
                item.getDescription(),
                item.getLocation(),
                item.getStatus().name(),
                item.getDateReported(),
                item.getUserId(),
                reporter != null ? reporter.getUsername() : null,
                reporter != null ? reporter.getEmail() : null
        );

        return ResponseEntity.ok(response);
    }

    @GetMapping(
            value = "/{id}/image",
            produces = MediaType.IMAGE_JPEG_VALUE
    )
    public ResponseEntity<byte[]> getItemImage(
            @PathVariable Long id) {

        Item item = itemService.getItemById(id);

        if (item == null ||
                item.getItemImage() == null ||
                item.getItemImage().length == 0) {

            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_JPEG)
                .body(item.getItemImage());
    }

    @PostMapping("/{id}/claims")
    public ResponseEntity<?> createClaim(
            @PathVariable Long id,
            @RequestBody ClaimRequest request,
            Authentication authentication) {

        Item item = itemService.getItemById(id);

        if (item == null) {
            return ResponseEntity.notFound().build();
        }

        Long claimerId = getAuthenticatedUserId(authentication);

        if (claimerId == null || !userRepository.existsById(claimerId)) {
            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "message",
                            "Please log in before submitting a claim."
                    ));
        }

        if (item.getUserId().equals(claimerId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of(
                            "message",
                            "You cannot claim your own report."
                    ));
        }

        if (item.getStatus() != ItemStatus.lost &&
                item.getStatus() != ItemStatus.found) {

            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of(
                            "message",
                            "This item is no longer available for claims."
                    ));
        }

        if (request.answers() == null ||
                request.answers().isBlank()) {

            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "message",
                            "Please answer the verification questions."
                    ));
        }

        if (claimRepository.existsByItemIdAndClaimerIdAndClaimStatusIn(
                id,
                claimerId,
                Set.of(
                        ClaimStatus.pending,
                        ClaimStatus.approved
                ))) {

            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of(
                            "message",
                            "You already have an active claim for this item."
                    ));
        }

        Claim claim = new Claim();

        claim.setItemId(id);
        claim.setClaimerId(claimerId);

        claim.setClaimType(
                item.getStatus() == ItemStatus.found
                        ? ClaimType.OWNERSHIP_REQUEST
                        : ClaimType.FOUND_MATCH
        );

        claim.setClaimAnswers(request.answers().trim());

        claimRepository.save(claim);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of(
                        "message",
                        "Claim request sent to the reporter for review."
                ));
    }

    @GetMapping("/{id}/claims")
    public ResponseEntity<?> getClaimsForReporter(
            @PathVariable Long id,
            Authentication authentication) {

        Item item = itemService.getItemById(id);

        if (item == null) {
            return ResponseEntity.notFound().build();
        }

        Long reporterId = getAuthenticatedUserId(authentication);

        if (!item.getUserId().equals(reporterId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        List<ClaimView> claims =
                claimRepository
                        .findByItemIdOrderByClaimDateDesc(id)
                        .stream()
                        .map(claim -> new ClaimView(
                                claim.getClaimId(),
                                userRepository
                                        .findById(claim.getClaimerId())
                                        .map(User::getUsername)
                                        .orElse("Unknown user"),
                                claim.getClaimType().name(),
                                claim.getClaimAnswers(),
                                claim.getClaimStatus().name(),
                                claim.getClaimDate()
                        ))
                        .toList();

        return ResponseEntity.ok(claims);
    }

    @PutMapping("/claims/{claimId}/decision")
    public ResponseEntity<?> decideClaim(
            @PathVariable Long claimId,
            @RequestBody ClaimDecisionRequest request,
            Authentication authentication) {

        Claim claim = claimRepository
                .findById(claimId)
                .orElse(null);

        if (claim == null) {
            return ResponseEntity.notFound().build();
        }

        Item item = itemService.getItemById(claim.getItemId());

        Long reporterId = getAuthenticatedUserId(authentication);

        if (item == null ||
                reporterId == null ||
                !item.getUserId().equals(reporterId)) {

            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of(
                            "message",
                            "Only the reporter can review this claim."
                    ));
        }

        if (claim.getClaimStatus() != ClaimStatus.pending) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of(
                            "message",
                            "This claim has already been reviewed."
                    ));
        }

        if (!"approved".equalsIgnoreCase(request.decision()) &&
                !"rejected".equalsIgnoreCase(request.decision())) {

            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "message",
                            "Decision must be approved or rejected."
                    ));
        }

        ClaimStatus decision =
                ClaimStatus.valueOf(
                        request.decision().toLowerCase()
                );

        if (decision == ClaimStatus.approved &&
                item.getStatus() != ItemStatus.lost &&
                item.getStatus() != ItemStatus.found) {

            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of(
                            "message",
                            "This item is no longer available for approval."
                    ));
        }

        claim.setClaimStatus(decision);
        claimRepository.save(claim);

        if (decision == ClaimStatus.approved) {
            item.setStatus(ItemStatus.claimed);
            itemService.saveItem(item);
        }

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "Claim " + decision + "."
                )
        );
    }

    @PostMapping("/report")
    public ResponseEntity<?> reportItem(
            @RequestBody ReportItemRequest request,
            Authentication authentication) {

        try {

            Item item = new Item();

            Long userId = getAuthenticatedUserId(authentication);

            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of(
                                "message",
                                "Please log in first."
                        ));
            }

            item.setUserId(userId);

            item.setItemName(request.getItemName());
            item.setItemType(request.getItemType());
            item.setDescription(request.getDescription());
            item.setLocation(request.getLocation());

            if (request.getDate() != null &&
                    !request.getDate().isBlank()) {

                item.setDateReported(
                        LocalDate.parse(request.getDate())
                                .atStartOfDay()
                );
            }

            ItemStatus status;

            switch (request.getStatus().toLowerCase()) {

                case "found" ->
                        status = ItemStatus.found;

                case "claimed" ->
                        status = ItemStatus.claimed;

                case "returned" ->
                        status = ItemStatus.returned;

                default ->
                        status = ItemStatus.lost;
            }

            item.setStatus(status);

            if (request.getImageBase64() != null &&
                    !request.getImageBase64().isEmpty()) {

                byte[] imageBytes =
                        ItemService.compressImage(
                                request.getImageBase64(),
                                600,
                                600
                        );

                item.setItemImage(imageBytes);
            }

            Item savedItem = itemService.saveItem(item);

            Map<String, Object> response = new HashMap<>();

            response.put(
                    "message",
                    "Item reported successfully!"
            );

            response.put("item", savedItem);

            return ResponseEntity.ok(response);

        } catch (Exception e) {

            Map<String, String> errorMap = new HashMap<>();

            errorMap.put(
                    "message",
                    "Failed to report item: " + e.getMessage()
            );

            return ResponseEntity.badRequest()
                    .body(errorMap);
        }
    }

    private Long getAuthenticatedUserId(
            Authentication authentication) {

        if (authentication == null ||
                !(authentication.getPrincipal()
                        instanceof AuthenticatedUser user)) {

            return null;
        }

        return user.userId();
    }
}

class ReportItemRequest {

    private String itemType;
    private String itemName;
    private String status;
    private String description;
    private String location;
    private String date;
    private String imageBase64;
    private long userId;

    public long getUserId() {
        return userId;
    }

    public String getItemType() {
        return itemType;
    }

    public void setItemType(String itemType) {
        this.itemType = itemType;
    }

    public String getItemName() {
        return itemName;
    }

    public void setItemName(String itemName) {
        this.itemName = itemName;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getImageBase64() {
        return imageBase64;
    }

    public void setImageBase64(String imageBase64) {
        this.imageBase64 = imageBase64;
    }
}
