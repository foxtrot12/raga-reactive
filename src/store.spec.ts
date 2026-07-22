import { describe, it, expect, vi } from "vitest";
import { getNewStore } from "./store";

describe("Store", () => {
  interface User {
    id: number;
    name: string;
    profile: {
      role: string;
      age: number;
    };
  }

  interface TestState {
    user: User;
    count: number;
    status: string;
  }

  it("should initialize store and set/get tokens", () => {
    const store = getNewStore<TestState>();
    expect(store.getToken("count")).toBeUndefined();

    store.setToken(10, "count");
    expect(store.getToken("count")).toBe(10);
  });

  it("should emit current value immediately upon subscription (ReplaySubject behavior)", () => {
    const store = getNewStore<TestState>();
    store.setToken(5, "count");

    const callback = vi.fn();
    store.subscribeToChange("count").subscribe(callback);

    // Should immediately get the current value (5)
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenLastCalledWith(5);

    // Next update
    store.setToken(6, "count");
    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenLastCalledWith(6);
  });

  it("should not emit duplicate values if same value is set", () => {
    const store = getNewStore<TestState>();
    const callback = vi.fn();
    
    store.subscribeToChange("count").subscribe(callback);
    expect(callback).toHaveBeenCalledTimes(0); // No value set yet

    store.setToken(1, "count");
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenLastCalledWith(1);

    // Set same value
    store.setToken(1, "count");
    expect(callback).toHaveBeenCalledTimes(1); // No new emission
  });

  it("should support selecting nested properties and applying distinctUntilChanged", () => {
    const store = getNewStore<TestState>();
    const user1: User = { id: 1, name: "Alice", profile: { role: "admin", age: 30 } };
    const user2: User = { id: 1, name: "Alice", profile: { role: "user", age: 30 } }; // name is same, role changed

    store.setToken(user1, "user");

    const nameCallback = vi.fn();
    const roleCallback = vi.fn();

    // Select name
    store.select("user", (u) => u.name).subscribe(nameCallback);
    // Select role
    store.select("user", (u) => u.profile.role).subscribe(roleCallback);

    expect(nameCallback).toHaveBeenCalledTimes(1);
    expect(nameCallback).toHaveBeenLastCalledWith("Alice");
    expect(roleCallback).toHaveBeenCalledTimes(1);
    expect(roleCallback).toHaveBeenLastCalledWith("admin");

    // Update token with same name but different role
    store.setToken(user2, "user");

    expect(nameCallback).toHaveBeenCalledTimes(1); // Name didn't change, shouldn't emit
    expect(roleCallback).toHaveBeenCalledTimes(2); // Role changed, should emit
    expect(roleCallback).toHaveBeenLastCalledWith("user");
  });

  it("should handle emptyStore (soft empty vs hard empty)", () => {
    const store = getNewStore<TestState>();
    store.setToken(42, "count");

    const callback = vi.fn();
    store.subscribeToChange("count").subscribe(callback);
    expect(callback).toHaveBeenLastCalledWith(42);

    // Soft empty
    store.emptyStore(false);
    expect(store.getToken("count")).toBeNull();
    expect(callback).toHaveBeenLastCalledWith(null);

    // Complete subscription testing via hard empty
    const completeCallback = vi.fn();
    store.subscribeToChange("count").subscribe({
      complete: completeCallback,
    });

    store.emptyStore(true);
    expect(store.getToken("count")).toBeUndefined();
    expect(completeCallback).toHaveBeenCalledTimes(1);
  });
});
