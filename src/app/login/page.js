import LoginForm from "../../components/LoginForm";

export default function Login() {
  return (
    <div>
      <div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
      </div>
      <LoginForm />
    </div>
  );
}
