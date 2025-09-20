export interface MiniAppAdapter {
  getUserAddress(): Promise<`0x${string}` | undefined>;
  signMessage(message: string): Promise<`0x${string}`>;
  share?(text: string): Promise<void>;
  notify?(title: string, body?: string): Promise<void>;
}