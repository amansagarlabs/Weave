package com.weave.message.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "messages")
public class Message {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false) private String threadId;
    private Long senderId;
    private Long recipientId;
    @Column(nullable = false, length = 5000) private String body;
    @Column(nullable = false, updatable = false) private Instant createdAt = Instant.now();
    protected Message() { }

    public static Message create(String threadId, Long senderId, Long recipientId, String body) {
        Message message = new Message();
        message.threadId = threadId;
        message.senderId = senderId;
        message.recipientId = recipientId;
        message.body = body;
        return message;
    }

    public Long getId() { return id; }
    public String getThreadId() { return threadId; }
    public Long getSenderId() { return senderId; }
    public Long getRecipientId() { return recipientId; }
    public String getBody() { return body; }
    public Instant getCreatedAt() { return createdAt; }
}
