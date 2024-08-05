import { Observable, Subject } from "rxjs";

interface TokenMapValueT<T> {
  subject: Subject<T>;
  value: T;
}

// Define the return type interface for the getNewStore function
export interface Store<StoreT> {
  getToken<K extends keyof StoreT>(key: K): StoreT[K];
  setToken<K extends keyof StoreT>(token: StoreT[K], key: K): void;
  emptyStore(hardEmpty?: boolean): Map<keyof StoreT, TokenMapValueT<any>>;
  subscribeToChange<K extends keyof StoreT>(key: K): Observable<StoreT[K]>;
}


export function getNewStore<StoreT>():Store<StoreT>  {
  type KeyT = keyof StoreT;
  type TokenMapT = Map<KeyT, TokenMapValueT<any>>;

  const tokenMap: TokenMapT = new Map();

  const getToken = <K extends KeyT = any>(key: K): StoreT[K] => {
    return tokenMap.get(key)?.value;
  };

  /**
   * Empties the entire store when Store Entity changes frequently due to multiple Implementations/Occurences
   * of same Entity in a Single User Session
   * @param hardEmpty Hard Emptying would also remove listeners attached to the keys of the Map
   * @returns
   */
  const emptyStore = (hardEmpty = false): TokenMapT => {
    if (hardEmpty) {
      tokenMap.clear();
    } else {
      tokenMap.forEach((token) => {
        token.value = null;
      });
    }

    return tokenMap;
  };

  const setToken = <K extends KeyT = any>(token: StoreT[K], key: K) => {
    if (tokenMap.get(key) === token) {
      return;
    }

    let existingSubject = tokenMap.get(key)?.subject;

    tokenMap.set(key, {
      subject: existingSubject || new Subject(),
      value: token,
    });

    if (existingSubject) {
      existingSubject.next(token);
    }
  };

  const subscribeToChange = <K extends KeyT = any>(key: K): Observable<StoreT[K]> => {
    const subject = tokenMap.get(key)?.subject;

    if (subject) {
      return subject.asObservable();
    } else {
      const newSubject = new Subject<StoreT[K]>();

      tokenMap.set(key, {
        subject: newSubject,
        value: null,
      });

      return newSubject.asObservable();
    }
  };

  return {
    getToken,
    setToken,
    emptyStore,
    subscribeToChange,
  };
}