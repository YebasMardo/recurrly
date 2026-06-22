import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import React, { useState } from "react";
import { Link } from "expo-router";
import clsx from "clsx";
import { useSignUp } from "@clerk/expo";

const SafeAreaView = styled(RNSafeAreaView);

const PLACEHOLDER_COLOR = "rgba(8, 17, 38, 0.35)";

const SignUp = () => {
  const { signUp, errors, fetchStatus } = useSignUp();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  const isSubmitting = fetchStatus === "fetching";

  const isAwaitingVerification =
    signUp.status === "missing_requirements" &&
    signUp.unverifiedFields.includes("email_address") &&
    signUp.missingFields.length === 0;

  const canSubmit =
    emailAddress.trim().length > 0 &&
    password.length > 0 &&
    confirmPassword.length > 0;

  // Finalizing flips `isSignedIn`, which the (auth) layout's <Redirect> picks up
  // to navigate away — no imperative navigation needed here.
  const completeSignUp = () => signUp.finalize();

  const handleSignUp = async () => {
    setFormError(null);
    setConfirmError(null);

    if (password !== confirmPassword) {
      setConfirmError("Passwords don't match");
      return;
    }

    const { error } = await signUp.password({ emailAddress, password });
    if (error) {
      setFormError(error.longMessage ?? error.message);
      return;
    }

    if (signUp.status === "complete") {
      await completeSignUp();
      return;
    }

    const { error: sendCodeError } = await signUp.verifications.sendEmailCode();
    if (sendCodeError) {
      console.error("Failed to send verification code:", sendCodeError);
      setFormError(
        sendCodeError.longMessage ??
          sendCodeError.message ??
          "We couldn't send a verification code. Please try again.",
      );
    }
  };

  const handleVerify = async () => {
    setFormError(null);

    const { error } = await signUp.verifications.verifyEmailCode({ code });
    if (error) {
      setFormError(error.longMessage ?? error.message);
      return;
    }

    if (signUp.status === "complete") {
      await completeSignUp();
    } else {
      setFormError("That code didn't work. Please try again.");
    }
  };

  return (
    <SafeAreaView className="auth-safe-area">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          className="auth-scroll"
          contentContainerClassName="auth-content"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="auth-brand-block">
            <View className="auth-logo-wrap">
              <View className="auth-logo-mark">
                <Text className="auth-logo-mark-text">R</Text>
              </View>
              <View>
                <Text className="auth-wordmark">Recurrly</Text>
                <Text className="auth-wordmark-sub">Smart Billing</Text>
              </View>
            </View>

            <Text className="auth-title">
              {isAwaitingVerification ? "Verify your email" : "Create your account"}
            </Text>
            <Text className="auth-subtitle">
              {isAwaitingVerification
                ? `Enter the 6-digit code we sent to ${emailAddress || "your email"}`
                : "Track every subscription and never miss a renewal"}
            </Text>
          </View>

          <View className="auth-card">
            {isAwaitingVerification ? (
              <View className="auth-form">
                <View className="auth-field">
                  <Text className="auth-label">Verification code</Text>
                  <TextInput
                    className="auth-input"
                    value={code}
                    onChangeText={setCode}
                    placeholder="000000"
                    placeholderTextColor={PLACEHOLDER_COLOR}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                </View>

                {formError && <Text className="auth-error">{formError}</Text>}

                <Pressable
                  className={clsx(
                    "auth-button",
                    (code.length === 0 || isSubmitting) && "auth-button-disabled",
                  )}
                  onPress={handleVerify}
                  disabled={code.length === 0 || isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#081126" />
                  ) : (
                    <Text className="auth-button-text">Verify & continue</Text>
                  )}
                </Pressable>

                <Pressable
                  className="auth-secondary-button"
                  onPress={() => signUp.verifications.sendEmailCode()}
                >
                  <Text className="auth-secondary-button-text">I need a new code</Text>
                </Pressable>
              </View>
            ) : (
              <View className="auth-form">
                <View className="auth-field">
                  <Text className="auth-label">Email</Text>
                  <TextInput
                    className={clsx(
                      "auth-input",
                      errors.fields.emailAddress && "auth-input-error",
                    )}
                    value={emailAddress}
                    onChangeText={setEmailAddress}
                    placeholder="Enter your email"
                    placeholderTextColor={PLACEHOLDER_COLOR}
                    autoCapitalize="none"
                    autoComplete="email"
                    keyboardType="email-address"
                  />
                  {errors.fields.emailAddress && (
                    <Text className="auth-error">
                      {errors.fields.emailAddress.message}
                    </Text>
                  )}
                </View>

                <View className="auth-field">
                  <Text className="auth-label">Password</Text>
                  <TextInput
                    className={clsx(
                      "auth-input",
                      errors.fields.password && "auth-input-error",
                    )}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Create a password"
                    placeholderTextColor={PLACEHOLDER_COLOR}
                    secureTextEntry
                    autoComplete="password-new"
                  />
                  {errors.fields.password && (
                    <Text className="auth-error">
                      {errors.fields.password.message}
                    </Text>
                  )}
                </View>

                <View className="auth-field">
                  <Text className="auth-label">Confirm password</Text>
                  <TextInput
                    className={clsx("auth-input", confirmError && "auth-input-error")}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Re-enter your password"
                    placeholderTextColor={PLACEHOLDER_COLOR}
                    secureTextEntry
                    autoComplete="password-new"
                  />
                  {confirmError && <Text className="auth-error">{confirmError}</Text>}
                </View>

                {formError && <Text className="auth-error">{formError}</Text>}

                <Pressable
                  className={clsx(
                    "auth-button",
                    (!canSubmit || isSubmitting) && "auth-button-disabled",
                  )}
                  onPress={handleSignUp}
                  disabled={!canSubmit || isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#081126" />
                  ) : (
                    <Text className="auth-button-text">Create account</Text>
                  )}
                </Pressable>

                <Text className="auth-helper">
                  By continuing, you agree to Recurrly&apos;s Terms of Service and
                  Privacy Policy.
                </Text>

                <View nativeID="clerk-captcha" />
              </View>
            )}

            <View className="auth-link-row">
              <Text className="auth-link-copy">Already have an account?</Text>
              <Link href="/(auth)/sign-in">
                <Text className="auth-link">Sign in</Text>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignUp;
