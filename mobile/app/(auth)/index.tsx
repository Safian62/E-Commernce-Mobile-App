import { View, Text, Image, TouchableOpacity, TextInput } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";

const AuthScreen = () => {
  const router = useRouter();
  const { login, register } = useAuth();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    setLoading(true);

    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        const result = await register(name, email, password);
        // Navigate to OTP verification screen
        router.push({
          pathname: "/(auth)/verify-otp",
          params: { email: result.email },
        });
      }
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error("Auth error", err);
      setError(err?.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="px-8 flex-1 justify-center items-center bg-white">
      {/* DEMO IMAGE */}
      <Image
        source={require("../../assets/images/auth-image.png")}
        className="size-96"
        resizeMode="contain"
      />

      <View className="w-full mt-4 gap-3">
        {error ? (
          <View className="bg-red-100 border border-red-300 rounded-lg p-2 mb-1">
            <Text className="text-red-600 text-xs">{error}</Text>
          </View>
        ) : null}

        {mode === "register" && (
          <View>
            <Text className="text-xs text-gray-600 mb-1">Name</Text>
            <TextInput
              className="border border-gray-300 rounded-full px-4 py-2 text-sm"
              placeholder="Your name"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>
        )}

        <View>
          <Text className="text-xs text-gray-600 mb-1">Email</Text>
          <TextInput
            className="border border-gray-300 rounded-full px-4 py-2 text-sm"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View>
          <Text className="text-xs text-gray-600 mb-1">Password</Text>
          <TextInput
            className="border border-gray-300 rounded-full px-4 py-2 text-sm"
            placeholder="********"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          className="flex-row items-center justify-center bg-black rounded-full px-6 py-3 mt-2"
          activeOpacity={0.7}
          disabled={loading}
          onPress={handleSubmit}
        >
          <Text className="text-white font-medium text-base">
            {loading ? "Please wait..." : mode === "login" ? "Login" : "Create account"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="mt-2 items-center"
          onPress={() => setMode(mode === "login" ? "register" : "login")}
        >
          <Text className="text-xs text-gray-500">
            {mode === "login" ? "New here? Create an account" : "Already have an account? Login"}
          </Text>
        </TouchableOpacity>
      </View>

      <Text className="text-center text-gray-500 text-xs leading-4 mt-6 px-2">
        By continuing, you agree to our <Text className="text-blue-500">Terms</Text>
        {", "}
        <Text className="text-blue-500">Privacy Policy</Text>
        {", and "}
        <Text className="text-blue-500">Cookie Use</Text>
      </Text>
    </View>
  );
};

export default AuthScreen;
