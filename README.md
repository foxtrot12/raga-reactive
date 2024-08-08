# RagaReactive

RagaReactive is a lightweight state management utility designed to simplify state handling in modern web applications. Built on top of RxJS, it offers a reactive approach to managing and subscribing to application state changes. The package provides two core components: a `Store` for managing state tokens and a `Notifier` for broadcasting changes.

### Key Features

- **RagaReactive**: Leverages RxJS to provide a reactive, observable-based interface for state management, enabling seamless integration with reactive programming patterns.

- **Token-Based Store**: 
  - **`getToken`**: Retrieve the current value associated with a specific token.
  - **`setToken`**: Update the value of a token, triggering notifications to any subscribers.
  - **`emptyStore`**: Clear all tokens from the store, with an option to remove listeners for a complete reset.
  - **`subscribeToChange`**: Subscribe to changes in a specific token, receiving updates whenever the token's value changes.

- **Notifier System**:
  - **`notify`**: Send notifications to subscribers when a specific event or token changes.
  - **`getNotified`**: Subscribe to notifications for specific events, receiving updates as observables.
  - **`conpleteNotification`**: Complete the notification for a specific event, signaling the end of notifications for that event.

### Usage

1. **Store Management**:
   - Initialize a store with `getNewStore` to manage state tokens dynamically.
   - Use `setToken` and `getToken` to manipulate and access stored values.
   - Employ `subscribeToChange` to react to state updates in your components or services.

2. **Notifier Integration**:
   - Create a notifier instance with `getNewNotifier` to handle event-based communication.
   - Use `notify` to broadcast changes or events.
   - `getNotified` allows components to subscribe to and react to specific events.

Here are some example code snippets to demonstrate how to use the `Store` and `Notifier` components from the state management utility:

### Example: Using the Store

Let's consider an example where we manage user information in the store:

```typescript
import { getNewStore } from 'raga-reactive';

interface User {
  id: number;
  name: string;
  email: string;
}

interface AppState {
  user: User;
  isLoggedIn: boolean;
}

const store = getNewStore<AppState>();

// Set initial state
store.setToken({ id: 1, name: 'John Doe', email: 'john@example.com' }, 'user');
store.setToken(false, 'isLoggedIn');

// Subscribe to changes in the user token
store.subscribeToChange('user').subscribe((user) => {
  console.log('User updated:', user);
});

// Update user information
store.setToken({ id: 1, name: 'Jane Doe', email: 'jane@example.com' }, 'user');

// Get current state of a token
const currentUser = store.getToken('user');
console.log('Current User:', currentUser);

// Empty the store
store.emptyStore();
```

### Example: Using the Notifier

Let's consider an example where we notify components about some events:

```typescript
import { getNewNotifier } from 'raga-reactive';

interface NotificationMap {
  newMessage: string;
  userLoggedIn: boolean;
}

const notifier = getNewNotifier<NotificationMap>();

// Subscribe to notifications for new messages
notifier.getNotified('newMessage').subscribe((message) => {
  console.log('New message received:', message);
});

// Notify subscribers about a new message
notifier.notify('Hello, you have a new message!', 'newMessage');

// Subscribe to notifications for user login
notifier.getNotified('userLoggedIn').subscribe((isLoggedIn) => {
  console.log('User login status:', isLoggedIn);
});

// Notify subscribers about user login status change
notifier.notify(true, 'userLoggedIn');

// Complete notifications for a specific key
notifier.conpleteNotification('newMessage');
```

### Combining Store and Notifier

You can combine both the `Store` and `Notifier` to create a cohesive state management solution for your application. Here's an example of how you might use both in a real application:

```typescript
interface GlobalState {
  user: User;
  theme: string;
}

interface GlobalNotifications {
  themeChanged: string;
}

const appStore = getNewStore<GlobalState>();
const appNotifier = getNewNotifier<GlobalNotifications>();

// Set and update global state
appStore.setToken({ id: 2, name: 'Alice', email: 'alice@example.com' }, 'user');
appStore.setToken('light', 'theme');

// Subscribe to store changes and notify subscribers
appStore.subscribeToChange('theme').subscribe((newTheme) => {
  console.log('Theme updated:', newTheme);
  appNotifier.notify(newTheme, 'themeChanged');
});

// Change theme and trigger notifications
appStore.setToken('dark', 'theme');

// Listen for theme change notifications
appNotifier.getNotified('themeChanged').subscribe((newTheme) => {
  console.log('Notifier received theme change:', newTheme);
});
```

### Explanation

- **Store Example**: We create a store to manage `user` and `isLoggedIn` state. We set initial values, subscribe to changes, update tokens, and retrieve the current state.

- **Notifier Example**: We create a notifier to handle events like `newMessage` and `userLoggedIn`. We subscribe to notifications and send events when necessary.

- **Combining Store and Notifier**: We demonstrate how the store and notifier can work together. For example, when the `theme` token changes, we notify all subscribers about the change using the notifier.