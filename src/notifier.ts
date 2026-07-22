import { Observable, Subject } from "rxjs";

type Notifier<NotifierMap> = {
  notify: <NotifierK extends keyof NotifierMap>(
    token: NotifierMap[NotifierK],
    key: NotifierK
  ) => void;
  getNotified: <NotifierK extends keyof NotifierMap>(
    key: NotifierK
  ) => Observable<NotifierMap[NotifierK]>;
  /** @deprecated Use completeNotification instead */
  conpleteNotification: <NotifierK extends keyof NotifierMap>(
    key: NotifierK
  ) => void;
  completeNotification: <NotifierK extends keyof NotifierMap>(
    key: NotifierK
  ) => void;
};

export function getNewNotifier<NotifierMap>(): Notifier<NotifierMap> {
  type NotifierKeysT = keyof NotifierMap;

  const tokenMap: Map<NotifierKeysT, Subject<NotifierMap[any]>> = new Map();

  const notify = <NotifierK extends NotifierKeysT>(
    token: NotifierMap[NotifierK],
    key: NotifierK
  ) => {
    let existingSubject = tokenMap.get(key);

    if (!existingSubject) {
      existingSubject = new Subject<NotifierMap[NotifierK]>();
      tokenMap.set(key, existingSubject);
    }

    existingSubject.next(token);
  };

  const getNotified = <NotifierK extends NotifierKeysT>(
    key: NotifierK
  ): Observable<NotifierMap[NotifierK]> => {
    const notifierSub = tokenMap.get(key);
    if (notifierSub) {
      return notifierSub.asObservable();
    } else {
      const newSubject = new Subject<NotifierMap[NotifierK]>();

      tokenMap.set(key, newSubject);

      return newSubject.asObservable();
    }
  };

  const completeNotification = <NotifierK extends NotifierKeysT>(
    key: NotifierK
  ) => {
    tokenMap.get(key)?.complete();
  };

  const conpleteNotification = completeNotification;

  return {
    notify,
    getNotified,
    conpleteNotification,
    completeNotification,
  };
}
