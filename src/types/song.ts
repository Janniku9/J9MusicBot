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
    notes: "",

    author: "",
    status: Status.CREATING,
    reason_of_denial: "",

    creation_date: undefined,
    submission_date: undefined,
    approval_date: undefined,

    message_id: -1,
    chat_id: -1,
    scores: []
}

export type Song = {
    uid: number, 
    url: string,
    title: string,
    artists: string[],
    genres: string[],
    notes: string,

    author: string,
    status: Status,

    moderator?: string,

    creation_date: Date | undefined,
    submission_date: Date | undefined,
    approval_date: Date | undefined,

    message_id: number,
    chat_id: number,
    scores: {user:string, score: number}[]

}