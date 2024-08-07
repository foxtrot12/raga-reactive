import { Observable, Subject } from "rxjs";

export interface TokenMapValueT<T> {
  subject: Subject<T>;
  value: T;
}

export interface TokenTypeBase{
  [key : string] : any
}

export interface Store<TokenT extends TokenTypeBase = any> {
  getToken<K extends keyof TokenT>(key: K): TokenT[K];
  setToken<K extends keyof TokenT>(token: TokenT[K], key: K): void;
  emptyStore(hardEmpty?: boolean): Map<keyof TokenT, TokenMapValueT<any>>;
  subscribeToChange<K extends keyof TokenT>(key: K): Observable<TokenT[K]>;
}

export function getNewStore<TokenT extends TokenTypeBase>():Store<TokenT> {
  type KeyT = keyof TokenT;
  type TokenMapT = Map<KeyT, TokenMapValueT<any>>;

  const tokenMap: TokenMapT = new Map();

  const getToken = <K extends KeyT = any>(key: K): TokenT[K] => {
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

  const setToken = <K extends KeyT = any>(token: TokenT[K], key: K) => {
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

  const subscribeToChange = <K extends KeyT = any>(key: K): Observable<TokenT[K]> => {
    const subject = tokenMap.get(key)?.subject;

    if (subject) {
      return subject.asObservable();
    } else {
      const newSubject = new Subject<TokenT[K]>();

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