import { describe, it, expect, vi } from "vitest";
import { getNewNotifier } from "./notifier";

describe("Notifier", () => {
  interface NotificationMap {
    login: boolean;
    message: string;
  }

  it("should send notifications to subscribers", () => {
    const notifier = getNewNotifier<NotificationMap>();
    const callback = vi.fn();

    notifier.getNotified("message").subscribe(callback);
    expect(callback).not.toHaveBeenCalled();

    notifier.notify("Hello World", "message");
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenLastCalledWith("Hello World");
  });

  it("should not miss the first notification even if notified before anyone subscribes (bug fix verification)", () => {
    const notifier = getNewNotifier<NotificationMap>();
    
    // We notify *first*
    notifier.notify(true, "login");

    const callback = vi.fn();
    notifier.getNotified("login").subscribe(callback);

    // Because it's a Subject (not a ReplaySubject/BehaviorSubject), standard RxJS Subject won't replay past values,
    // which is the correct Subject behavior.
    expect(callback).not.toHaveBeenCalled();

    // Now notify again, subscriber should receive it.
    notifier.notify(false, "login");
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenLastCalledWith(false);
  });

  it("should complete notifications correctly using both completeNotification and conpleteNotification", () => {
    const notifier = getNewNotifier<NotificationMap>();
    const complete1 = vi.fn();
    const complete2 = vi.fn();

    notifier.getNotified("message").subscribe({
      complete: complete1,
    });
    notifier.getNotified("login").subscribe({
      complete: complete2,
    });

    // completeNotification spelling typo corrected
    notifier.completeNotification("message");
    expect(complete1).toHaveBeenCalledTimes(1);

    // conpleteNotification deprecated spelling alias compatibility check
    notifier.conpleteNotification("login");
    expect(complete2).toHaveBeenCalledTimes(1);
  });
});
