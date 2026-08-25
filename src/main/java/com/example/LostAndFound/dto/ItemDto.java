package com.example.LostAndFound.dto;

public class ItemDto {
    private Long itemId;
    private String itemName;
    private String itemType;
    private String description;
    private String location;
    private String dateReported;  
    private String status;


    public ItemDto() {}
    public ItemDto(Long itemId, String itemName, String itemType, String description, String location,
            String dateReported, String status) {
        this.itemId = itemId;
        this.itemName = itemName;
        this.itemType = itemType;
        this.description = description;
        this.location = location;
        this.dateReported = dateReported;
        this.status = status;
    }

    public Long getItemId() {
        return itemId;
    }
    public void setItemId(Long itemId) {
        this.itemId = itemId;
    }
    public String getItemName() {
        return itemName;
    }
    public void setItemName(String itemName) {
        this.itemName = itemName;
    }
    public String getItemType() {
        return itemType;
    }
    public void setItemType(String itemType) {
        this.itemType = itemType;
    }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getDateReported() {
        return dateReported;
    }
    public void setDateReported(String dateReported) {
        this.dateReported = dateReported;
    }
    public String getStatus() {
        return status;
    }
    public void setStatus(String status) {
        this.status = status;
    }
}
