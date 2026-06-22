import { Image, Pressable, Text, View } from "react-native";
import React, { useState } from "react";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import clsx from "clsx";
import { useClerk, useUser } from "@clerk/expo";
import avatar from "@/assets/images/avatar.png";

const SafeAreaView = styled(RNSafeAreaView);

const Settings = () => {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const displayName =
    user?.fullName || user?.firstName || user?.primaryEmailAddress?.emailAddress || "Account";

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut();
  };

  return (
    <SafeAreaView className="bg-background flex-1 p-5">
      <Text className="settings-header">Settings</Text>

      <View className="settings-profile-card">
        <Image
          source={user?.imageUrl ? { uri: user.imageUrl } : avatar}
          className="settings-avatar"
        />
        <View className="settings-profile-copy">
          <Text className="settings-name" numberOfLines={1}>
            {displayName}
          </Text>
          {user?.primaryEmailAddress?.emailAddress && (
            <Text className="settings-email" numberOfLines={1}>
              {user.primaryEmailAddress.emailAddress}
            </Text>
          )}
        </View>
      </View>

      <Pressable
        className={clsx(
          "settings-signout-button",
          isSigningOut && "settings-signout-button-disabled",
        )}
        onPress={handleSignOut}
        disabled={isSigningOut}
      >
        <Text className="settings-signout-text">
          {isSigningOut ? "Signing out..." : "Sign out"}
        </Text>
      </Pressable>
    </SafeAreaView>
  );
};

export default Settings;
