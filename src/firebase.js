// Mock Firebase Authentication
const mockAuth = {
  currentUser: null,
  async signInWithGoogle() {
    // Simulate a successful Google sign-in
    const mockUser = {
      uid: 'mock-user-123',
      email: 'demo@example.com',
      displayName: 'Demo User',
      photoURL: 'https://ui-avatars.com/api/?name=Demo+User'
    };
    this.currentUser = mockUser;
    return { user: mockUser };
  },
  async signOut() {
    this.currentUser = null;
  }
};

// Export the mock auth
export const auth = mockAuth;
export default { auth: mockAuth }; 