import { Observable, ReplaySubject } from "rxjs";
import { map, distinctUntilChanged } from "rxjs/operators";

export interface TokenMapValueT<T> {
  subject: ReplaySubject<T>;
  value: T;
}

export interface TokenTypeBase {
  [key: string]: any;
}

export interface Store<TokenT extends TokenTypeBase = any> {
  getToken<K extends keyof TokenT>(key: K): TokenT[K];
  setToken<K extends keyof TokenT>(token: TokenT[K], key: K): void;
  emptyStore(hardEmpty?: boolean): Map<keyof TokenT, TokenMapValueT<any>>;
  subscribeToChange<K extends keyof TokenT>(key: K): Observable<TokenT[K]>;
  select<K extends keyof TokenT, R>(
    key: K,
    selector: (value: TokenT[K]) => R
  ): Observable<R>;
}

export function getNewStore<TokenT extends TokenTypeBase>(): Store<TokenT> {
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
      tokenMap.forEach((token) => {
        token.subject.complete();
      });
      tokenMap.clear();
    } else {
      tokenMap.forEach((token) => {
        token.value = null as any;
        token.subject.next(null as any);
      });
    }

    return tokenMap;
  };

  const setToken = <K extends KeyT = any>(token: TokenT[K], key: K) => {
    if (tokenMap.get(key)?.value === token) {
      return;
    }

    let existingSubject = tokenMap.get(key)?.subject;

    if (!existingSubject) {
      existingSubject = new ReplaySubject<any>(1);
    }

    tokenMap.set(key, {
      subject: existingSubject,
      value: token,
    });

    existingSubject.next(token);
  };

  const subscribeToChange = <K extends KeyT = any>(key: K): Observable<TokenT[K]> => {
    const subject = tokenMap.get(key)?.subject;

    if (subject) {
      return subject.asObservable();
    } else {
      const newSubject = new ReplaySubject<TokenT[K]>(1);

      tokenMap.set(key, {
        subject: newSubject,
        value: null as any,
      });

      return newSubject.asObservable();
    }
  };

  const select = <K extends KeyT = any, R = any>(
    key: K,
    selector: (value: TokenT[K]) => R
  ): Observable<R> => {
    return subscribeToChange(key).pipe(
      map(selector),
      distinctUntilChanged()
    );
  };

  return {
    getToken,
    setToken,
    emptyStore,
    subscribeToChange,
    select,
  };
}