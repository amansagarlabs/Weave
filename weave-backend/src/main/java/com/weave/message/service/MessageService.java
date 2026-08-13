package com.weave.message.service;

import com.weave.auth.entity.User;
import com.weave.auth.repository.UserRepository;
import com.weave.message.dto.CreateMessageRequest;
import com.weave.message.dto.MessageResponse;
import com.weave.message.entity.Message;
import com.weave.message.repository.MessageRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@Service
public class MessageService {
    private final MessageRepository messages;
    private final UserRepository users;

    public MessageService(MessageRepository messages, UserRepository users) { this.messages = messages; this.users = users; }

    public MessageResponse send(String email, CreateMessageRequest request) {
        User sender = users.findByEmail(email).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return MessageResponse.from(messages.save(Message.create(request.threadId(), sender.getId(), request.recipientId(), request.body().trim())));
    }

    public List<MessageResponse> thread(String threadId) { return messages.findByThreadIdOrderByCreatedAtAsc(threadId).stream().map(MessageResponse::from).toList(); }
}
