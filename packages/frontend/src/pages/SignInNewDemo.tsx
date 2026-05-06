import { SignInPageNew } from '@/components/ui/sign-in-flow-new';

const SignInNewDemo = () => {
  const handleSignInSuccess = (email: string) => {
    console.log('Sign in successful with email:', email);
    // Here you would typically redirect to dashboard or handle authentication
  };

  return (
    <div className="w-full h-screen">
      <SignInPageNew onSignInSuccess={handleSignInSuccess} />
    </div>
  );
};

export default SignInNewDemo;
