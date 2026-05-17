import { RefreshControl, FlatList, Platform, View } from "react-native";
import React, { useState, useCallback, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";
import {
  useContinueWatching,
  useHomeRows,
  useTrendingMovies,
  useTrendingShows,
  useUserHomeRowsList,
} from "./../../services/catalogService";
import HorizontalList from "@/components/HorizontalList";
import HomeDetails from "@/components/home/HomeDetails";
import { useFocusEffect } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useServerInfo } from "@/services/internalService";
import { ServerVersionGTE } from "@/utils/version";

export default function Index() {
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const { data: serverInfo, isLoading: isServerInfoLoading } = useServerInfo();

  // new homerows/catalogs api starting from 0.2.0-beta
  // check for backwards compatibility
  const useNewCatalogAPI = isServerInfoLoading
    ? false
    : ServerVersionGTE(serverInfo?.data?.version, "0.2.0-beta");
  const continueWatchingQuery = useContinueWatching();
  // Before v0.2.0, keep for backward compatibility
  const trendingMoviesQuery = useTrendingMovies(!useNewCatalogAPI);
  const trendingShowsQuery = useTrendingShows(!useNewCatalogAPI);

  const { data: userHomeRowsList, isLoading: isUserHomeRowsLoading } =
    useUserHomeRowsList(useNewCatalogAPI);
  const homeRows = useHomeRows(
    isUserHomeRowsLoading ? 0 : (userHomeRowsList?.home_rows?.length ?? 0),
    useNewCatalogAPI,
  );

  // hide splash screen after all queries done, this helps with focus handling as well
  let isAllReady = false;
  if (useNewCatalogAPI) {
    isAllReady =
      !isServerInfoLoading &&
      !isUserHomeRowsLoading &&
      !continueWatchingQuery.isLoading;
  } else {
    isAllReady = !isServerInfoLoading;
    !trendingMoviesQuery.isLoading &&
      !trendingShowsQuery.isLoading &&
      !continueWatchingQuery.isLoading;
  }

  React.useEffect(() => {
    if (isAllReady) {
      SplashScreen.hide();
    }
  }, [isAllReady]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["trending-movies"] }),
      queryClient.invalidateQueries({ queryKey: ["trending-shows"] }),
      queryClient.invalidateQueries({ queryKey: ["continue-watching"] }),
    ]);
    setRefreshing(false);
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      Promise.all([
        // probably no need to refresh trending that quickly
        // queryClient.invalidateQueries({ queryKey: ["trending-movies"] }),
        // queryClient.invalidateQueries({ queryKey: ["trending-shows"] }),
        queryClient.invalidateQueries({ queryKey: ["continue-watching"] }),
      ]);
    }, []),
  );

  let rows = [
    {
      key: "continueWatching",
      header: "Continue Watching",
      query: continueWatchingQuery,
      itemType: "episode",
    },
  ];

  if (useNewCatalogAPI && !isUserHomeRowsLoading && userHomeRowsList) {
    let newRows = userHomeRowsList?.home_rows?.map(
      (row: any, index: number) => ({
        key: index + ":" + row.title,
        header: row.title,
        query: homeRows[index],
      }),
    );
    rows.push(...newRows);
  } else {
    rows.push({
      key: "trendingMovies",
      header: "Trending Movies",
      query: trendingMoviesQuery,
      itemType: "",
    });
    rows.push({
      key: "trendingShows",
      header: "Trending Shows",
      query: trendingShowsQuery,
      itemType: "",
    });
  }

  // Find the first row that actually has data to give it initial focus
  // eg. continue watching is typically at the top, but it might not have data
  let preferredRowKey = rows?.find(
    (row) => row.query.data && row.query.data.length > 0,
  )?.key;

  if (useNewCatalogAPI && !preferredRowKey) {
    preferredRowKey = rows?.find(
      (row) => row.query.data?.items && row.query.data.items.length > 0,
    )?.key;
  }

  const verticalListRef = useRef<FlatList>(null);
  return (
    <SafeAreaView className="flex-1 bg-black h-full">
      {Platform.isTV ? <HomeDetails /> : <View className="h-5" />}
      <View className="flex-1 pb-5">
        <FlatList
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          scrollEnabled={!Platform.isTV}
          ref={verticalListRef}
          data={rows}
          keyExtractor={(item) => item.key}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={false}
          renderItem={({ item, index }) => (
            <HorizontalList
              key={item.key}
              header={item.header}
              itemData={
                useNewCatalogAPI && item.itemType !== "episode"
                  ? item?.query?.data?.items
                  : item?.query?.data
              }
              isLoading={item.query.isLoading}
              itemType={item.itemType}
              rowIndex={index}
              hasPreferredFocus={isAllReady && item.key === preferredRowKey}
              onRowFocus={(rowIndex: number) => {
                if (!Platform.isTV) return;
                verticalListRef.current?.scrollToIndex({
                  index: rowIndex,
                  viewPosition: 0.5,
                  animated: true,
                });
              }}
            />
          )}
          ItemSeparatorComponent={() => <View className="h-5" />}
        />
      </View>
    </SafeAreaView>
  );
}
