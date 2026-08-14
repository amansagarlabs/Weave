package com.weave.message.service;

import com.weave.auth.entity.User;
import com.weave.auth.repository.UserRepository;
import com.weave.booking.entity.Booking;
import com.weave.booking.repository.BookingRepository;
import com.weave.message.dto.CreateMessageRequest;
import com.weave.message.dto.MessageResponse;
import com.weave.message.entity.Message;
import com.weave.message.repository.MessageRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.LinkedHashMap;
import java.util.Map;
import com.weave.message.dto.ConversationSummary;

@Service
public class MessageService {
    private final MessageRepository messages;
    private final UserRepository users;
    private final BookingRepository bookings;

    public MessageService(MessageRepository messages, UserRepository users, BookingRepository bookings) { this.messages = messages; this.users = users; this.bookings = bookings; }

    public MessageResponse send(String email, CreateMessageRequest request) {
        User sender = users.findByEmail(email).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        User recipient = users.findById(request.recipientId()).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Recipient not found"));
        if (sender.getId().equals(recipient.getId())) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot message yourself");
        if (request.threadId().startsWith("booking-")) bookingParticipant(request.threadId(), sender, recipient);
        return MessageResponse.from(messages.save(Message.create(request.threadId(), sender.getId(), request.recipientId(), request.body().trim())));
    }

    public List<MessageResponse> thread(String email, String threadId) {
        User user = user(email);
        List<Message> items = messages.findByThreadIdOrderByCreatedAtAsc(threadId);
        if (items.stream().noneMatch(item -> item.getSenderId().equals(user.getId()) || item.getRecipientId().equals(user.getId())) && !bookingParticipant(threadId, user, null)) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Conversation not found");
        return items.stream().map(MessageResponse::from).toList();
    }

    public List<ConversationSummary> inbox(String email) {
        User user = user(email);
        Map<String, ConversationSummary> summaries = new LinkedHashMap<>();
        for (Message message : messages.findBySenderIdOrRecipientIdOrderByCreatedAtDesc(user.getId(), user.getId())) {
            if (!summaries.containsKey(message.getThreadId())) {
                Long participant = message.getSenderId().equals(user.getId()) ? message.getRecipientId() : message.getSenderId();
                User participantUser = users.findById(participant).orElse(null);
                Booking booking = bookingForThread(message.getThreadId());
                summaries.put(message.getThreadId(), new ConversationSummary(
                        message.getThreadId(), participant,
                        participantUser == null ? null : participantUser.getEmail(),
                        participantUser == null ? null : participantUser.getRole().name(),
                        message.getBody(), message.getCreatedAt(),
                        booking == null ? null : booking.getId(),
                        booking == null ? null : booking.getStatus(),
                        booking == null ? null : booking.getAmount()
                ));
            }
        }
        return List.copyOf(summaries.values());
    }

    private User user(String email) { return users.findByEmail(email).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found")); }

    private Booking bookingForThread(String threadId) {
        if (!threadId.startsWith("booking-")) return null;
        try { return bookings.findById(Long.parseLong(threadId.substring("booking-".length()))).orElse(null); }
        catch (NumberFormatException exception) { return null; }
    }

    private boolean bookingParticipant(String threadId, User sender, User recipient) {
        if (!threadId.startsWith("booking-")) return false;
        long bookingId;
        try { bookingId = Long.parseLong(threadId.substring("booking-".length())); } catch (NumberFormatException exception) { throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid booking conversation"); }
        Booking booking = bookings.findById(bookingId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));
        boolean senderAllowed = booking.getBrandId().equals(sender.getId()) || booking.getCreatorId().equals(sender.getId());
        if (!senderAllowed) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not a booking participant");
        if (recipient != null) { Long expected = booking.getBrandId().equals(sender.getId()) ? booking.getCreatorId() : booking.getBrandId(); if (!expected.equals(recipient.getId())) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Recipient is not the booking participant"); }
        return true;
    }
}
