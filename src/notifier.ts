import { Observable, Subject } from "rxjs";

/**
 * Notifier is Used for Sending any type of notification and events inside out application,
 * Notifier does not have any session storage
 */
export class Notifier<MapKey = string> {
    
	private tokenMap: Map<MapKey, {
		subject: Subject<any>
	}> = new Map();

	public notify(token: any, key: MapKey) {

		let existingSubject = this.tokenMap.get(key)?.subject;

		if(!existingSubject){
			this.tokenMap.set(key, {
				subject: new Subject()
			});
		}

		if(existingSubject) {
			existingSubject.next(token);
		}

	}

	public getNotified<TokenType = any>(key: MapKey): Observable<TokenType> {
		if(this.tokenMap.get(key)?.subject) {
			return (this.tokenMap.get(key) as any).subject.asObservable();
		} else {
			let newSubject = new Subject<TokenType>();
			
			this.tokenMap.set(key, {
				subject: newSubject
			});

			return newSubject.asObservable();
		}
	}
}