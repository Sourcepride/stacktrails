type GoogleResponse = {
  credential: string; // this is the ID token
};

export async function googleSignIn(clientId: string): Promise<GoogleResponse> {
  return new Promise((resolve, reject) => {
    // @ts-expect-error - Google loads this globally
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response: GoogleResponse) => {
        resolve(response);
      },
    });

    // @ts-expect-error not used
    window.google.accounts.id.prompt((notification: any) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        reject("User closed popup or blocked login");
      }
    });
  });
}
