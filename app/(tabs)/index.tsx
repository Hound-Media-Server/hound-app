import { View, Text, ScrollView, FlatList } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useTrendingMovies,
  useTrendingShows,
} from "./../../services/catalogService";
import HorizontalList from "@/components/HorizontalList";
import { Link, Route } from "expo-router";

export default function Index() {
  return (
    <SafeAreaView className="flex-1 bg-black">
      <View className="flex-1">
        <ScrollView
          className="flex-1 ps-5"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 10,
          }}
        >
          <Text className="font-bold text-red-500 text-3xl">Hound</Text>
          <Link
            href={
              "/stream/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjoie1wibWVkaWFfc291cmNlXCI6XCJ0bWRiXCIsXCJzb3VyY2VfaWRcIjoxMzk2LFwibWVkaWFfdHlwZVwiOlwidHZzaG93XCIsXCJpbWRiX2lkXCI6XCJ0dDA5MDM3NDdcIixcInNlYXNvblwiOjMsXCJlcGlzb2RlXCI6MixcInNvdXJjZV9lcGlzb2RlX2lkXCI6NjIxMDYsXCJhZGRvblwiOlwiVG9ycmVudGlvXCIsXCJjYWNoZWRcIjpcInRydWVcIixcInNlcnZpY2VcIjpcIlJEXCIsXCJwMnBcIjpcImRlYnJpZFwiLFwiaW5mb2hhc2hcIjpcIjczZjllMjE1ZWQwZTEzNzQxMmRhMTkxYTFkNjUzOTk0ZmM1N2ZkOTZcIixcImluZGV4ZXJcIjpcIjEzMzd4XCIsXCJmaWxlX25hbWVcIjpcIkJyZWFraW5nIEJhZCBTMDMgRTAyIEJsdVJheSA3MjBwIEVuZ2xpc2ggQUFDIDUuMSB4MjY0IEVTdWIgLSBta3ZDaW5lbWFzLm1rdlwiLFwiZm9sZGVyX25hbWVcIjpcIkJyZWFraW5nIEJhZCBTMDEtUzA1IENvbXBsZXRlIEJsdVJheSA3MjBwIEVuZ2xpc2ggQUFDIDUuMSB4MjY0IEVTdWIgLSBta3ZDaW5lbWFzIFtUZWxseV1cIixcInJlc29sdXRpb25cIjpcIjcyMHBcIixcImZpbGVfaWR4XCI6LTEsXCJmaWxlX3NpemVcIjo0NDAwMzQ5MTgsXCJyYW5rXCI6MTA4MDAsXCJzZWVkZXJzXCI6MSxcImxlZWNoZXJzXCI6LTEsXCJzb3VyY2VzXCI6W10sXCJ1cmxcIjpcImh0dHBzOi8vdG9ycmVudGlvLnN0cmVtLmZ1bi9yZXNvbHZlL3JlYWxkZWJyaWQvNEZIQ05QSVRITUNVQ1JFR0QzRE5DTDQ1TTVKT1dUR0NKTFZCRkdSRTRFQTRLWDNYTVVUUS83M2Y5ZTIxNWVkMGUxMzc0MTJkYTE5MWExZDY1Mzk5NGZjNTdmZDk2L251bGwvMjEvQnJlYWtpbmclMjBCYWQlMjBTMDMlMjBFMDIlMjBCbHVSYXklMjA3MjBwJTIwRW5nbGlzaCUyMEFBQyUyMDUuMSUyMHgyNjQlMjBFU3ViJTIwLSUyMG1rdkNpbmVtYXMubWt2XCIsXCJlbmNvZGVkX2RhdGFcIjpcIlwiLFwiZGF0YVwiOntcImNvZGVjXCI6XCJhdmNcIixcImF1ZGlvXCI6W1wiQUFDXCJdLFwic3ViYmVkXCI6ZmFsc2UsXCJkdWJiZWRcIjpmYWxzZSxcImNoYW5uZWxzXCI6W1wiNS4xXCJdLFwiY29udGFpbmVyXCI6XCJta3ZcIixcImxhbmd1YWdlc1wiOltcImVuXCJdLFwiYml0X2RlcHRoXCI6XCJcIixcImhkclwiOltdfX0ifQ.xrjfUaQKwOvUjDMng4aJyTkvmLV3hvTuM9mDDJ5F6Cs" as Route
            }
          >
            <Text className="text-white text-xl">Stream</Text>
          </Link>
          <HorizontalList useQuery={useTrendingShows} title="Trending Shows" />
          <HorizontalList
            useQuery={useTrendingMovies}
            title="Trending Movies"
          />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
