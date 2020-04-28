export enum Status {
    CREATING,
    PENDING,
    APPROVED,
    DENIED
}

export const default_song = {
    uid: -1,
    url: "",
    title: "",
    artists: [],
    genres: [],

    author: "",
    status: Status.CREATING,

    moderator: "",
    reason_of_denial: "",

    creation_date: undefined,
    submission_date: undefined,
    approval_date: undefined,
    scores: []
}

export type Song = {
    uid: number, 
    url: string,
    title: string,
    artists: string[],
    genres: string[],

    author: string,
    status: Status,

    moderator: string,
    reason_of_denial: string,

    creation_date: Date | undefined,
    submission_date: Date | undefined,
    approval_date: Date | undefined,

    scores: {user:string, score: number}[]

}