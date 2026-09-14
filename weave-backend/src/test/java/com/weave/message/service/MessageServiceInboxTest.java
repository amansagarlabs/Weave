package com.weave.message.service;

import com.weave.auth.entity.Role;
import com.weave.auth.entity.User;
import com.weave.auth.repository.UserRepository;
import com.weave.booking.repository.BookingRepository;
import com.weave.message.dto.CreateMessageRequest;
import com.weave.message.dto.InboxUpdatePayload;
import com.weave.message.entity.Message;
import com.weave.message.repository.MessageRepository;
import com.weave.notification.service.NotificationService;
import org.junit.jupiter.api.Test;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import java.util.List;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.contains;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.never;

class MessageServiceInboxTest {
    private static User user(String email, Role role, long id) {
        User user = User.create(email, null, "hash", role);
        user.markEmailVerified();
        try {
            var field = User.class.getDeclaredField("id");
            field.setAccessible(true);
            field.set(user, id);
        } catch (ReflectiveOperationException e) { throw new IllegalStateException(e); }
        return user;
    }

    @Test
    void sendingMessagePublishesInboxUpdateToRecipient() {
        MessageRepository messages = mock(MessageRepository.class);
        UserRepository users = mock(UserRepository.class);
        BookingRepository bookings = mock(BookingRepository.class);
        NotificationService notifications = mock(NotificationService.class);
        SimpMessagingTemplate broker = mock(SimpMessagingTemplate.class);

        User sender = user("alice@example.com", Role.CREATOR, 1L);
        User recipient = user("bob@example.com", Role.BRAND, 2L);
        Message saved = Message.create("thread-1", 1L, 2L, "Hello there");

        when(users.findByEmail("alice@example.com")).thenReturn(Optional.of(sender));
        when(users.findById(2L)).thenReturn(Optional.of(recipient));
        when(messages.save(any(Message.class))).thenReturn(saved);
        when(messages.findByThreadIdOrderByCreatedAtAsc("thread-1")).thenReturn(List.of(saved));

        MessageService service = new MessageService(messages, users, bookings, notifications, broker);
        service.send("alice@example.com", new CreateMessageRequest("thread-1", 2L, "Hello there"));

        verify(broker).convertAndSend(eq("/topic/user/2/inbox"), any(InboxUpdatePayload.class));
    }

    @Test
    void inboxUpdateNotSentToSender() {
        MessageRepository messages = mock(MessageRepository.class);
        UserRepository users = mock(UserRepository.class);
        BookingRepository bookings = mock(BookingRepository.class);
        NotificationService notifications = mock(NotificationService.class);
        SimpMessagingTemplate broker = mock(SimpMessagingTemplate.class);

        User sender = user("alice@example.com", Role.CREATOR, 1L);
        User recipient = user("bob@example.com", Role.BRAND, 2L);
        Message saved = Message.create("thread-1", 1L, 2L, "Hello");

        when(users.findByEmail("alice@example.com")).thenReturn(Optional.of(sender));
        when(users.findById(2L)).thenReturn(Optional.of(recipient));
        when(messages.save(any(Message.class))).thenReturn(saved);
        when(messages.findByThreadIdOrderByCreatedAtAsc("thread-1")).thenReturn(List.of(saved));

        MessageService service = new MessageService(messages, users, bookings, notifications, broker);
        service.send("alice@example.com", new CreateMessageRequest("thread-1", 2L, "Hello"));

        verify(broker, never()).convertAndSend(eq("/topic/user/1/inbox"), any(InboxUpdatePayload.class));
    }

    @Test
    void previewTruncatedAt80Chars() {
        MessageRepository messages = mock(MessageRepository.class);
        UserRepository users = mock(UserRepository.class);
        BookingRepository bookings = mock(BookingRepository.class);
        NotificationService notifications = mock(NotificationService.class);
        SimpMessagingTemplate broker = mock(SimpMessagingTemplate.class);

        User sender = user("alice@example.com", Role.CREATOR, 1L);
        User recipient = user("bob@example.com", Role.BRAND, 2L);
        String longBody = "A".repeat(100);
        Message saved = Message.create("thread-1", 1L, 2L, longBody);

        when(users.findByEmail("alice@example.com")).thenReturn(Optional.of(sender));
        when(users.findById(2L)).thenReturn(Optional.of(recipient));
        when(messages.save(any(Message.class))).thenReturn(saved);
        when(messages.findByThreadIdOrderByCreatedAtAsc("thread-1")).thenReturn(List.of(saved));

        MessageService service = new MessageService(messages, users, bookings, notifications, broker);
        service.send("alice@example.com", new CreateMessageRequest("thread-1", 2L, longBody));

        var argument = org.mockito.ArgumentCaptor.forClass(InboxUpdatePayload.class);
        verify(broker).convertAndSend(eq("/topic/user/2/inbox"), argument.capture());
        assertEquals(81, argument.getValue().latestMessagePreview().length());
        assertTrue(argument.getValue().latestMessagePreview().endsWith("…"));
    }

    @Test
    void shortPreviewNotTruncated() {
        MessageRepository messages = mock(MessageRepository.class);
        UserRepository users = mock(UserRepository.class);
        BookingRepository bookings = mock(BookingRepository.class);
        NotificationService notifications = mock(NotificationService.class);
        SimpMessagingTemplate broker = mock(SimpMessagingTemplate.class);

        User sender = user("alice@example.com", Role.CREATOR, 1L);
        User recipient = user("bob@example.com", Role.BRAND, 2L);
        Message saved = Message.create("thread-1", 1L, 2L, "Hey!");

        when(users.findByEmail("alice@example.com")).thenReturn(Optional.of(sender));
        when(users.findById(2L)).thenReturn(Optional.of(recipient));
        when(messages.save(any(Message.class))).thenReturn(saved);
        when(messages.findByThreadIdOrderByCreatedAtAsc("thread-1")).thenReturn(List.of(saved));

        MessageService service = new MessageService(messages, users, bookings, notifications, broker);
        service.send("alice@example.com", new CreateMessageRequest("thread-1", 2L, "Hey!"));

        var argument = org.mockito.ArgumentCaptor.forClass(InboxUpdatePayload.class);
        verify(broker).convertAndSend(eq("/topic/user/2/inbox"), argument.capture());
        assertEquals("Hey!", argument.getValue().latestMessagePreview());
    }
}
