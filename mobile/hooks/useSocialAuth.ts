
function useSocialAuth() {
  return {
    loadingStrategy: null as string | null,
    handleSocialAuth: async () => {},
    isSignUp: false,
    user: null,
  };
}

export default useSocialAuth;
