package com.example.LostAndFound.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "claims")
public class Claim {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "claim_id")
    private Long claimId;

    @Column(name = "item_id", nullable = false)
    private Long itemId;

    @Column(name = "claimer_id", nullable = false)
    private Long claimerId;

    @Enumerated(EnumType.STRING)
    @Column(name = "claim_status", nullable = false)
    private ClaimStatus claimStatus = ClaimStatus.pending;

    @Enumerated(EnumType.STRING)
    @Column(name = "claim_type")
    private ClaimType claimType;

    @Lob
    @Column(name = "claim_answers")
    private String claimAnswers;

    @Column(name = "claim_date", updatable = false)
    private LocalDateTime claimDate;

    @PrePersist
    private void setClaimDate() {
        if (claimDate == null) claimDate = LocalDateTime.now();
    }

    public Long getClaimId() { return claimId; }
    public Long getItemId() { return itemId; }
    public void setItemId(Long itemId) { this.itemId = itemId; }
    public Long getClaimerId() { return claimerId; }
    public void setClaimerId(Long claimerId) { this.claimerId = claimerId; }
    public ClaimStatus getClaimStatus() { return claimStatus; }
    public void setClaimStatus(ClaimStatus claimStatus) { this.claimStatus = claimStatus; }
    public ClaimType getClaimType() { return claimType; }
    public void setClaimType(ClaimType claimType) { this.claimType = claimType; }
    public String getClaimAnswers() { return claimAnswers; }
    public void setClaimAnswers(String claimAnswers) { this.claimAnswers = claimAnswers; }
    public LocalDateTime getClaimDate() { return claimDate; }
}
