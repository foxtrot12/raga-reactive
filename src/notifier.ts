import { Observable, Subject } from "rxjs";

type Notifier<NotifierMap> = {
  notify: <NotifierK extends keyof NotifierMap>(
    token: NotifierMap[NotifierK],
    key: NotifierK
  ) => void;
  getNotified: <NotifierK extends keyof NotifierMap>(
    key: NotifierK
  ) => Observable<NotifierMap[NotifierK]>;
  conpleteNotification: <NotifierK extends keyof NotifierMap>(
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
      const newSub = new Subject<NotifierMap[NotifierK]>();
      tokenMap.set(key, newSub);
    }

    if (existingSubject) {
      existingSubject.next(token);
    }
  };

  const getNotified = <NotifierK extends NotifierKeysT>(
    key: NotifierK
  ): Observable<NotifierMap[NotifierK]> => {
    const notifierSub = tokenMap.get(key);
    if (notifierSub) {
      return notifierSub;
    } else {
      const newSubject = new Subject<NotifierMap[NotifierK]>();

      tokenMap.set(key, newSubject);

      return newSubject.asObservable();
    }
  };

  const conpleteNotification = <NotifierK extends NotifierKeysT>(
    key: NotifierK
  ) => {
    tokenMap.get(key)?.complete();
  };

  return {
    notify,
    getNotified,
    conpleteNotification,
  };
}
