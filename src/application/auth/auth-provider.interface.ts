export interface AuthProvider {
  getUserId(): Promise<string | null>;
  getUser(): Promise<{ id: string; name: string; email: string } | null>;
  signUp(email: string, password: string, name: string): Promise<string>;
  signIn(email: string, password: string): Promise<string>;
  signOut(): Promise<void>;
  updateName(userId: string, name: string): Promise<void>;
  resetPassword(email: string): Promise<void>;
  updatePassword(password: string): Promise<void>;
  deleteUser(userId: string): Promise<void>;
}
