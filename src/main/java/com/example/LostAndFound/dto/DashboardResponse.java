package com.example.LostAndFound.dto;

import java.util.List;

public class DashboardResponse {
    private String fullName;      
    private long lostCount;    
    private long foundCount;      
    private long claimedCount;   
    private List<ItemDto> recentItems;


    public String getFullName() {
        return fullName;
    }
    public void setFullName(String fullName) {
        this.fullName = fullName;
    }
    public long getLostCount() {
        return lostCount;
    }
    public void setLostCount(long lostCount) {
        this.lostCount = lostCount;
    }
    public long getFoundCount() {
        return foundCount;
    }
    public void setFoundCount(long foundCount) {
        this.foundCount = foundCount;
    }
    public long getClaimedCount() {
        return claimedCount;
    }
    public void setClaimedCount(long claimedCount) {
        this.claimedCount = claimedCount;
    }
    public List<ItemDto> getRecentItems() {
        return recentItems;
    }
    public void setRecentItems(List<ItemDto> recentItems) {
        this.recentItems = recentItems;
    }
}