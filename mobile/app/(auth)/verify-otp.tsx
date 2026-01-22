import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/context/AuthContext";

const VerifyOTPScreen = () => {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const { verifyOTP } = useAuth();

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = async () => {
    const emailValue = Array.isArray(email) ? email[0] : email;
    if (!emailValue) {
      setError("Missing email. Please go back and register again.");
      return;
    }

    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await verifyOTP(emailValue, otp);
      // Navigation will happen automatically via AuthContext state change
    } catch (err: any) {
      console.error("OTP verification error", err);
      setError(err?.response?.data?.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="px-8 flex-1 justify-center items-center bg-white">
      <View className="w-full max-w-sm">
        <Text className="text-2xl font-bold text-center mb-2">Verify Your Email</Text>
        <Text className="text-gray-600 text-center mb-6">
          We&apos;ve sent a 6-digit verification code to{"\n"}
          <Text className="font-semibold">{Array.isArray(email) ? email[0] : email}</Text>
        </Text>

        {error ? (
          <View className="bg-red-100 border border-red-300 rounded-lg p-3 mb-4">
            <Text className="text-red-600 text-sm text-center">{error}</Text>
          </View>
        ) : null}

        <View className="mb-6">
          <Text className="text-xs text-gray-600 mb-2">Enter OTP Code</Text>
          <TextInput
            className="border border-gray-300 rounded-full px-4 py-3 text-lg text-center tracking-widest"
            placeholder="000000"
            value={otp}
            onChangeText={(text) => {
              // Only allow numbers and limit to 6 digits
              const numericText = text.replace(/[^0-9]/g, "").slice(0, 6);
              setOtp(numericText);
              setError("");
            }}
            keyboardType="number-pad"
            maxLength={6}
            autoFocus
          />
        </View>

        <TouchableOpacity
          className="flex-row items-center justify-center bg-black rounded-full px-6 py-3 mt-2"
          activeOpacity={0.7}
          disabled={loading || otp.length !== 6}
          onPress={handleVerify}
        >
          <Text className="text-white font-medium text-base">
            {loading ? "Verifying..." : "Verify Email"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="mt-4 items-center"
          onPress={() => router.back()}
        >
          <Text className="text-xs text-gray-500">Back to registration</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default VerifyOTPScreen;

