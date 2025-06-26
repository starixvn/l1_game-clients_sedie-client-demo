export interface AnyConstructor<T = any> {
    new (...params: any[]): T;
}

export interface IContainer {
    resolve<T>(ctor: AnyConstructor<T> | string): T;
}
