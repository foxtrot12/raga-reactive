# RagaReactive

**RagaReactive** is a state management library built with RxJS, designed to provide a simple yet powerful way to manage state in your applications. It leverages observables and subjects to handle data flow, ensuring your app is dynamic and responsive.

## Features

- **Easy to Use**: Simple API for managing application state.
- **Reactive**: Built with RxJS to handle asynchronous data streams effortlessly.
- **Scalable**: Suitable for both small and large applications.
- **Flexible**: Integrates seamlessly with your existing architecture.

## Installation

You can install RagaReactive using npm:

```bash
npm install raga-reactive
```

## Getting Started

Here's a quick example to get you started with RagaReactive:

```typescript
import { getNewStore } from 'raga-reactive';

// Define the shape of your store
interface AppState {
  user: string;
  loggedIn: boolean;
}

// Create a new store
const store = getNewStore<AppState>();

// Set a token in the store
store.setToken('John Doe', 'user');
store.setToken(true, 'loggedIn');

// Subscribe to changes
store.subscribeToChange('user').subscribe((user) => {
  console.log('User updated:', user);
});

// Get a token from the store
const currentUser = store.getToken('user');
console.log('Current user:', currentUser);

// Empty the store
store.emptyStore();
```

## API

### `getNewStore<StoreT>()`

Creates a new store instance.

- **Returns**: An object with methods to manage state.

### Methods

#### `getToken<K extends KeyT>(key: K): StoreT[K]`

Retrieves the value associated with the given key.

#### `setToken<K extends KeyT>(token: StoreT[K], key: K)`

Sets a new value for the specified key in the store.

#### `emptyStore(hardEmpty = false): StoreT`

Empties the store. If `hardEmpty` is `true`, it also removes all listeners.

#### `subscribeToChange<K extends KeyT>(key: K): Observable<StoreT[K]>`

Returns an observable that emits the value whenever it changes.

## License

This project is licensed under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue.

## Contact

For questions or feedback, please contact Chinmaya at s.chinmaya@myyahoo.com.
