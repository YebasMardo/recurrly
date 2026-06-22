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
import { useSignIn } from "@clerk/expo";

const SafeAreaView = styled(RNSafeAreaView);

const PLACEHOLDER_COLOR = "rgba(8, 17, 38, 0.35)";

const SignIn = () => {
  const { signIn, errors, fetchStatus } = useSignIn();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const isSubmitting = fetchStatus === "fetching";
  const needsVerification = signIn.status === "needs_client_trust";
  const canSubmit = emailAddress.trim().length > 0 && password.length > 0;

  // Finalizing flips `isSignedIn`, which the (auth) layout's <Redirect> picks up
  // to navigate away — no imperative navigation needed here.
  const completeSignIn = () => signIn.finalize();

  const handleSignIn = async () => {
    setFormError(null);

    const { error } = await signIn.password({ emailAddress, password });
    if (error) {
      setFormError(error.longMessage ?? error.message);
      return;
    }

    if (signIn.status === "complete") {
      await completeSignIn();
    } else if (signIn.status === "needs_client_trust") {
      const emailCodeFactor = signIn.supportedSecondFactors.find(
        (factor) => factor.strategy === "email_code",
      );
      if (emailCodeFactor) await signIn.mfa.sendEmailCode();
    } else {
      setFormError("We couldn't sign you in. Please try again.");
    }
  };

  const handleVerify = async () => {
    setFormError(null);

    const { error } = await signIn.mfa.verifyEmailCode({ code });
    if (error) {
      setFormError(error.longMessage ?? error.message);
      return;
    }

    if (signIn.status === "complete") {
      await completeSignIn();
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
              {needsVerification ? "Confirm it's you" : "Welcome back"}
            </Text>
            <Text className="auth-subtitle">
              {needsVerification
                ? "Enter the 6-digit code we sent to your email to finish signing in."
                : "Sign in to continue managing your subscriptions"}
            </Text>
          </View>

          <View className="auth-card">
            {needsVerification ? (
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
                    <Text className="auth-button-text">Verify & sign in</Text>
                  )}
                </Pressable>

                <Pressable
                  className="auth-secondary-button"
                  onPress={() => signIn.mfa.sendEmailCode()}
                >
                  <Text className="auth-secondary-button-text">Resend code</Text>
                </Pressable>
              </View>
            ) : (
              <View className="auth-form">
                <View className="auth-field">
                  <Text className="auth-label">Email</Text>
                  <TextInput
                    className={clsx(
                      "auth-input",
                      errors.fields.identifier && "auth-input-error",
                    )}
                    value={emailAddress}
                    onChangeText={setEmailAddress}
                    placeholder="Enter your email"
                    placeholderTextColor={PLACEHOLDER_COLOR}
                    autoCapitalize="none"
                    autoComplete="email"
                    keyboardType="email-address"
                  />
                  {errors.fields.identifier && (
                    <Text className="auth-error">
                      {errors.fields.identifier.message}
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
                    placeholder="Enter your password"
                    placeholderTextColor={PLACEHOLDER_COLOR}
                    secureTextEntry
                    autoComplete="password"
                  />
                  {errors.fields.password && (
                    <Text className="auth-error">
                      {errors.fields.password.message}
                    </Text>
                  )}
                </View>

                {formError && <Text className="auth-error">{formError}</Text>}

                <Pressable
                  className={clsx(
                    "auth-button",
                    (!canSubmit || isSubmitting) && "auth-button-disabled",
                  )}
                  onPress={handleSignIn}
                  disabled={!canSubmit || isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#081126" />
                  ) : (
                    <Text className="auth-button-text">Sign in</Text>
                  )}
                </Pressable>
              </View>
            )}

            <View className="auth-link-row">
              <Text className="auth-link-copy">New to Recurrly?</Text>
              <Link href="/(auth)/sign-up">
                <Text className="auth-link">Create an account</Text>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignIn;
