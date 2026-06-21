import { FlatList, Image, StyleSheet, Text, View } from "react-native";
import React from "react";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import avatar from "@/assets/images/avatar.png";
import { icons } from "@/constants/icons";
import { HOME_BALANCE, UPCOMING_SUBSCRIPTIONS } from "@/constants/data";
import { formatCurrency } from "@/lib/utils";
import dayjs from "dayjs";
import ListHeading from "@/components/ListHeading";
import UpcomingSubscriptionCard from "@/components/UpcomingSubscriptionCard";

const SafeAreaView = styled(RNSafeAreaView);

const index = () => {
  return (
    <SafeAreaView className="bg-background flex-1 p-5">
      <View className="home-header">
        <View className="home-user">
          <Image source={avatar} className="home-avatar" />
          <Text className="home-user-name">Pierre Y.</Text>
        </View>
        <Image source={icons.add} className="home-add-icon" />
      </View>

      <View className="home-balance-card">
        <Text className="home-balance-label">Balance</Text>

        <View className="home-balance-row">
          <Text className="home-balance-amount">
            {formatCurrency(HOME_BALANCE.amount)}
          </Text>
          <Text className="home-balance-date">
            {dayjs(HOME_BALANCE.nextRenewalDate).format("MM/DD")}
          </Text>
        </View>
      </View>

      <View className="mb-5">
        <ListHeading title="Upcoming" />

        <FlatList 
          data={UPCOMING_SUBSCRIPTIONS}
          renderItem={({item}) => (<UpcomingSubscriptionCard {...item}/>)}
          keyExtractor={(item=> item.id)}
          horizontal
          showsHorizontalScrollIndicator={false}
          ListEmptyComponent={<Text className="home-empty-state">No upcoming renewals yet.</Text>}
        />
      </View>

      <View>
        
      </View>
    </SafeAreaView>
  );
};

export default index;

const styles = StyleSheet.create({});
