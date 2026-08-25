package com.example.LostAndFound.repository;

import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.LostAndFound.entity.Claim;
import com.example.LostAndFound.entity.ClaimStatus;

public interface ClaimRepository extends JpaRepository<Claim, Long> {
    List<Claim> findByItemIdOrderByClaimDateDesc(Long itemId);
    boolean existsByItemIdAndClaimerIdAndClaimStatusIn(Long itemId, Long claimerId,
            Collection<ClaimStatus> statuses);
}
