export interface QueueListener{
    notify(): Promise<void>
}